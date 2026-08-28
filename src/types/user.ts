import type { User } from '@supabase/supabase-js';

export interface AppUser {
  id: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string | null;
  isTelegram: boolean;
}

export function buildAppUser(authUser: User | null): AppUser | null {
  if (!authUser) return null;

  const metadata = authUser.user_metadata ?? {};
  const isTelegram = metadata.provider === 'telegram';

  return {
    id: authUser.id,
    email: authUser.email,
    displayName: isTelegram ? (metadata.full_name as string | undefined) : authUser.email,
    avatarUrl: isTelegram ? ((metadata.avatar_url as string | null) ?? null) : null,
    isTelegram,
  };
}
