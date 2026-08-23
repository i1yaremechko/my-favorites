import type { MediaType } from './movie';

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
