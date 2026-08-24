import { getTelegramWebApp } from '../utils/telegram';

import { supabase } from './supabaseClient';

interface TelegramAuthResponse {
  access_token: string;
  refresh_token: string;
}

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-auth`;

// Обмінює Telegram initData на справжню Supabase-сесію через Edge Function,
// яка перевіряє HMAC-підпис на сервері (bot token ніколи не потрапляє на клієнт).
export async function signInWithTelegram(): Promise<void> {
  const webApp = getTelegramWebApp();
  const initData = webApp?.initData;

  if (!initData) {
    throw new Error('Немає Telegram initData — застосунок відкрито поза Telegram');
  }

  const response = await fetch(FUNCTIONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      // Gateway Supabase Edge Functions вимагає валідний Bearer-токен ще ДО
      // того, як запит дістанеться коду самої функції (JWT verification на
      // рівні платформи) — без цього заголовка запит відхиляється з 401 ще
      // на вході, і verifyInitData() у коді функції взагалі не встигає
      // виконатись (тому в логах функції було порожньо).
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ initData }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Не вдалося авторизуватися через Telegram');
  }

  const { access_token, refresh_token } = (await response.json()) as TelegramAuthResponse;

  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error) throw error;
}
