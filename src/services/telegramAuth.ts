import { getTelegramWebApp } from '@/utils/telegram';

import { supabase } from './supabaseClient';

interface TelegramAuthResponse {
  access_token: string;
  refresh_token: string;
}

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-auth`;

export async function signInWithTelegram(): Promise<void> {
  const webApp = getTelegramWebApp();
  const initData = webApp?.initData;

  if (!initData) {
    throw new Error('No Telegram initData - the application is opened outside Telegram');
  }

  const response = await fetch(FUNCTIONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ initData }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to log in via Telegram');
  }

  const { access_token, refresh_token } = (await response.json()) as TelegramAuthResponse;

  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error) throw error;
}
