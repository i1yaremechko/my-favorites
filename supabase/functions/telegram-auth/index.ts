import { createClient } from 'npm:@supabase/supabase-js@2';

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const MAX_INIT_DATA_AGE_SECONDS = 24 * 60 * 60;

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') ?? '*';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function hmacSha256(key: BufferSource, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyInitData(
  initData: string,
  botToken: string
): Promise<Record<string, string> | null> {
  const params = new URLSearchParams(initData);
  const receivedHash = params.get('hash');
  if (!receivedHash) return null;

  params.delete('hash');

  const dataCheckString = [...params.keys()]
    .sort()
    .map((key) => `${key}=${params.get(key)}`)
    .join('\n');

  const secretKey = await hmacSha256(new TextEncoder().encode('WebAppData'), botToken);
  const computedHash = toHex(await hmacSha256(secretKey, dataCheckString));

  if (computedHash !== receivedHash) return null;

  const authDate = Number(params.get('auth_date'));
  if (!authDate || Date.now() / 1000 - authDate > MAX_INIT_DATA_AGE_SECONDS) return null;

  return Object.fromEntries(params.entries());
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  if (!BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not configured');
    return json({ error: 'Server is not configured' }, 500);
  }

  try {
    const { initData } = await req.json();

    if (typeof initData !== 'string' || !initData) {
      return json({ error: 'initData is required' }, 400);
    }

    const verified = await verifyInitData(initData, BOT_TOKEN);
    if (!verified) {
      return json({ error: 'Invalid or expired Telegram signature' }, 401);
    }

    const tgUser = JSON.parse(verified.user ?? '{}');
    if (!tgUser?.id) {
      return json({ error: 'User is missing in initData' }, 400);
    }

    const email = `tg-${tgUser.id}@telegram.my-favorite.app`;
    const displayName =
      [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') ||
      tgUser.username ||
      `Telegram ${tgUser.id}`;

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let userId: string;

    const { data: existingUsers } = await admin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === email);

    if (existingUser) {
      userId = existingUser.id;
      await admin.auth.admin.updateUserById(userId, {
        user_metadata: {
          provider: 'telegram',
          telegram_id: tgUser.id,
          telegram_username: tgUser.username ?? null,
          full_name: displayName,
          avatar_url: tgUser.photo_url ?? null,
        },
      });
    } else {
      const { data: createdUser, error: createError } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          provider: 'telegram',
          telegram_id: tgUser.id,
          telegram_username: tgUser.username ?? null,
          full_name: displayName,
          avatar_url: tgUser.photo_url ?? null,
        },
      });

      if (createError || !createdUser?.user) {
        console.error('createUser error:', createError);
        return json({ error: 'Failed to create user' }, 500);
      }
      userId = createdUser.user.id;
    }

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    if (linkError || !linkData) {
      console.error('generateLink error:', linkError);
      return json({ error: 'Failed to generate link' }, 500);
    }

    const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        type: 'magiclink',
        token_hash: linkData.properties.hashed_token,
      }),
    });

    const verifyResult = await verifyRes.json();

    if (!verifyRes.ok || !verifyResult.access_token) {
      console.error('Verify token error:', verifyResult);
      return json({ error: 'Failed to verify session' }, 500);
    }

    return json({
      access_token: verifyResult.access_token,
      refresh_token: verifyResult.refresh_token,
      user: {
        id: userId,
        email,
        name: displayName,
        avatar_url: tgUser.photo_url ?? null,
      },
    });
  } catch (err) {
    console.error('telegram-auth error:', err);
    return json({ error: 'Internal server error' }, 500);
  }
});
