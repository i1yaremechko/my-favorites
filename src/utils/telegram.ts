export interface TelegramWebAppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: { user?: TelegramWebAppUser; [key: string]: unknown };
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  ready: () => void;
  expand: () => void;
  close: () => void;
  showAlert: (message: string, callback?: () => void) => void;
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp ?? null;
}

// SDK-скрипт (telegram-web-app.js) підключений завжди — і на звичайному сайті,
// і в Mini App. Поза Telegram `initData` буде порожнім рядком, тому саме
// його наявність, а не сам факт window.Telegram, є надійною ознакою того,
// що застосунок відкрито всередині Telegram.
export function isTelegramMiniApp(): boolean {
  return Boolean(getTelegramWebApp()?.initData);
}
