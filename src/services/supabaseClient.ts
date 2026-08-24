import { createClient } from '@supabase/supabase-js';

import type { Comment } from '../types/comment';
import type { MediaType, Movie } from '../types/movie';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface FavoriteMovieRecord {
  id?: number;
  user_id: string;
  movie_id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  media_type: 'movie' | 'tv';
  runtime?: number | null;
  genre_ids?: number[] | null;
}

export interface CommentRecord {
  id?: number;
  user_id: string;
  movie_id: number;
  media_type: 'movie' | 'tv';
  author_name: string;
  author_avatar_url: string | null;
  text: string;
  created_at?: string;
}

export const supabaseService = {
  // --- АВТЕНТИФІКАЦІЯ ---

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Явно вказуємо поточний origin — Supabase все одно звірить його зі
        // списком Redirect URLs у Auth → URL Configuration, і якщо там немає
        // збігу, підставить Site URL за замовчуванням. Без цього рядка
        // поведінка та сама, але так — явно й читабельно.
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session?.user || null;
  },

  // --- УЛЮБЛЕНІ ФІЛЬМИ (FAVORITES) ---

  // Отримати список улюблених для конкретного користувача
  async getFavorites(userId: string): Promise<Movie[]> {
    const { data, error } = await supabase.from('favorites').select('*').eq('user_id', userId);

    if (error) throw error;

    // Мапимо дані з бази назад у наш інтерфейс Movie
    return (data || []).map((item) => ({
      id: item.movie_id,
      title: item.title,
      overview: '', // за потреби можна зберігати повністю або підтягувати з TMDB
      posterPath: item.poster_path,
      backdropPath: null,
      releaseDate: item.release_date,
      voteAverage: item.vote_average,
      voteCount: 0,
      genreIds: item.genre_ids || [],
      mediaType: item.media_type,
      runtime: item.runtime,
    }));
  },

  // Додати фільм до улюблених
  async addFavorite(userId: string, movie: Movie): Promise<void> {
    const record: FavoriteMovieRecord = {
      user_id: userId,
      movie_id: movie.id,
      title: movie.title,
      poster_path: movie.posterPath,
      release_date: movie.releaseDate,
      vote_average: movie.voteAverage,
      media_type: movie.mediaType,
      runtime: movie.runtime,
      genre_ids: movie.genreIds,
    };

    const { error } = await supabase.from('favorites').insert([record]);
    if (error) throw error;
  },

  // Видалити фільм з улюблених
  async removeFavorite(userId: string, movieId: number): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('movie_id', movieId);

    if (error) throw error;
  },

  // Перевірити, чи у списку улюблених
  async isFavorite(userId: string, movieId: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('movie_id', movieId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  async getFavoriteCount(movieId: number): Promise<number> {
    const { count, error } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('movie_id', movieId);

    if (error) throw error;
    return count || 0;
  },

  // Отримати всі записи улюблених від усіх користувачів (для глобального каталогу)
  async getAllFavorites(): Promise<(Movie & { favoriteCount: number })[]> {
    const { data, error } = await supabase.from('favorites').select('*');

    if (error) throw error;

    const countsMap = new Map<number, number>();
    const moviesMap = new Map<number, Movie>();

    for (const item of data || []) {
      const movieId = item.movie_id;

      // Збільшуємо лічильник для цього movie_id
      countsMap.set(movieId, (countsMap.get(movieId) || 0) + 1);

      // Зберігаємо об'єкт фільму (якщо ще не зберегли)
      if (!moviesMap.has(movieId)) {
        moviesMap.set(movieId, {
          id: movieId,
          title: item.title,
          overview: '',
          posterPath: item.poster_path,
          backdropPath: null,
          releaseDate: item.release_date,
          voteAverage: item.vote_average,
          voteCount: 0,
          genreIds: item.genre_ids || [], // Зберігаємо жанри, якщо вони є в базі, або пустий масив
          mediaType: item.media_type,
          runtime: item.runtime,
        });
      }
    }

    // Повертаємо масив фільмів разом із підрахованим favoriteCount
    return Array.from(moviesMap.values()).map((movie) => ({
      ...movie,
      favoriteCount: countsMap.get(movie.id) || 1,
    }));
  },

  // --- КОМЕНТАРІ ---

  // Отримати всі коментарі під конкретним фільмом/серіалом (найновіші зверху)
  async getComments(movieId: number, mediaType: MediaType): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('movie_id', movieId)
      .eq('media_type', mediaType)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((item) => ({
      id: item.id,
      userId: item.user_id,
      movieId: item.movie_id,
      mediaType: item.media_type,
      authorName: item.author_name,
      authorAvatarUrl: item.author_avatar_url,
      text: item.text,
      createdAt: item.created_at,
    }));
  },

  // Додати коментар. author_name/author_avatar_url зберігаємо знімком на
  // момент публікації (той самий підхід, що і з title у favorites) — це
  // дозволяє показувати автора без потреби джойнити на auth.users, доступ до
  // якого RLS все одно заборонив би для чужих записів.
  async addComment(params: {
    userId: string;
    movieId: number;
    mediaType: MediaType;
    authorName: string;
    authorAvatarUrl: string | null;
    text: string;
  }): Promise<Comment> {
    const record: CommentRecord = {
      user_id: params.userId,
      movie_id: params.movieId,
      media_type: params.mediaType,
      author_name: params.authorName,
      author_avatar_url: params.authorAvatarUrl,
      text: params.text,
    };

    const { data, error } = await supabase.from('comments').insert([record]).select().single();
    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      movieId: data.movie_id,
      mediaType: data.media_type,
      authorName: data.author_name,
      authorAvatarUrl: data.author_avatar_url,
      text: data.text,
      createdAt: data.created_at,
    };
  },

  // Видалити свій коментар (RLS все одно заблокує чужий, .eq('user_id', ...) — подвійна підстраховка)
  async deleteComment(commentId: number, userId: string): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) throw error;
  },
};
