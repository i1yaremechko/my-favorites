import { createClient } from '@supabase/supabase-js';

import type { Comment } from '@/types/comment';
import type { MediaType, Movie } from '@/types/movie';

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

export interface FeedbackRecord {
  user_id?: string | null;
  name?: string | null;
  email?: string | null;
  message: string;
}

export const supabaseService = {
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
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

  async getFavorites(userId: string): Promise<Movie[]> {
    const { data, error } = await supabase.from('favorites').select('*').eq('user_id', userId);

    if (error) throw error;

    return (data || []).map((item) => ({
      id: item.movie_id,
      title: item.title,
      overview: '',
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

  async removeFavorite(userId: string, movieId: number): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('movie_id', movieId);

    if (error) throw error;
  },

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

  async getFavoriteCounts(movieIds: number[]): Promise<Record<number, number>> {
    if (movieIds.length === 0) return {};

    const { data, error } = await supabase
      .from('favorites_summary')
      .select('movie_id, favorite_count')
      .in('movie_id', movieIds);

    if (error) throw error;

    const counts: Record<number, number> = {};
    for (const row of data || []) {
      counts[row.movie_id] = row.favorite_count;
    }
    return counts;
  },

  async getAllFavorites(): Promise<(Movie & { favoriteCount: number })[]> {
    const { data, error } = await supabase.from('favorites_summary').select('*');

    if (error) throw error;

    return (data || []).map((item) => ({
      id: item.movie_id,
      title: item.title,
      overview: '',
      posterPath: item.poster_path,
      backdropPath: null,
      releaseDate: item.release_date,
      voteAverage: item.vote_average,
      voteCount: 0,
      genreIds: item.genre_ids || [],
      mediaType: item.media_type,
      runtime: item.runtime,
      favoriteCount: item.favorite_count,
    }));
  },

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

  async deleteComment(commentId: number, userId: string): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async submitFeedback(params: {
    userId?: string | null;
    name?: string;
    email?: string;
    message: string;
  }): Promise<void> {
    const record: FeedbackRecord = {
      user_id: params.userId ?? null,
      name: params.name?.trim() || null,
      email: params.email?.trim() || null,
      message: params.message.trim(),
    };

    const { error } = await supabase.from('feedback').insert([record]);
    if (error) throw error;
  },
};
