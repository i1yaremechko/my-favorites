import type { Language } from './language';

export type MediaType = 'movie' | 'tv';

export interface Movie {
  id: number;
  title: string;
  originalTitle?: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  voteAverage: number;
  voteCount: number;
  genreIds: number[];
  mediaType: MediaType;
  runtime?: number | null;
  favoriteCount?: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieFilterParams {
  query?: string;
  genreId?: number;
  year?: number;
  sortBy?: 'popularity.desc' | 'release_date.desc' | 'vote_average.desc';
  page: number;
  mediaType?: MediaType;
  language: Language;
}

// Провайдер перегляду (як платний, так і безкоштовний)
export interface WatchProvider {
  providerId: number;
  providerName: string;
  logoUrl: string;
}

export interface WatchProvidersResult {
  paidProviders: WatchProvider[]; // flatrate (підписка) + rent + buy
  freeProviders: WatchProvider[]; // free + ads (з рекламою)
  // Посилання на сторінку TMDB/JustWatch із перегляду — за умовами використання
  // цих даних TMDB вимагає лінкувати саме сюди, а не напряму на сервіс
  attributionLink: string | null;
}
