import type { MediaType } from '@/types/movie';

export const MAX_COMMENT_LENGTH = 500;

export interface CommentsCurrentUser {
  id: string;
  displayName?: string;
  avatarUrl?: string | null;
}

export interface Comment {
  id: number;
  userId: string;
  movieId: number;
  mediaType: MediaType;
  authorName: string;
  authorAvatarUrl: string | null;
  text: string;
  createdAt: string;
}

export interface CommentsProps {
  movieId: number;
  mediaType: MediaType;
  currentUser: CommentsCurrentUser | null;
  onRequestLogin?: () => void;
}
