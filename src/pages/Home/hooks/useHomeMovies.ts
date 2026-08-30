import { useCallback, useEffect, useState } from 'react';

import type { ViewMode } from '@/components/Filters/types';
import { supabaseService } from '@/services/supabaseClient';
import { tmdbApi } from '@/services/tmdbApi';
import type { MediaType, Movie, MovieFilterParams } from '@/types/movie';
import { localizeMovies } from '@/utils/localizeMovies';

interface UseHomeMoviesParams {
  searchQuery: string;
  language: string;
}

const ITEMS_PER_PAGE = 20;

export const useHomeMovies = ({ searchQuery, language }: UseHomeMoviesParams) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mediaType, setMediaType] = useState<MediaType>('movie');
  const [selectedGenreId, setSelectedGenreId] = useState<number | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>('catalog');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const handleMediaTypeChange = useCallback((type: MediaType) => {
    setMediaType(type);
    setSelectedGenreId(undefined);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [mediaType, selectedGenreId, selectedYear, viewMode, searchQuery, language]);

  const loadMovies = useCallback(async () => {
    setIsLoading(true);
    try {
      if (viewMode === 'catalog') {
        let fetchedMovies = await supabaseService.getAllFavorites();

        fetchedMovies = fetchedMovies.filter((m) => m.mediaType === mediaType);

        if (selectedGenreId) {
          fetchedMovies = fetchedMovies.filter((m) => m.genreIds?.includes(selectedGenreId));
        }

        if (selectedYear) {
          fetchedMovies = fetchedMovies.filter((m) => {
            if (!m.releaseDate) return false;
            const movieYear = new Date(m.releaseDate).getFullYear();
            return movieYear === selectedYear;
          });
        }

        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          fetchedMovies = fetchedMovies.filter((m) => m.title.toLowerCase().includes(query));
        }

        fetchedMovies.sort((a, b) => b.favoriteCount - a.favoriteCount);

        const calculatedTotalPages = Math.ceil(fetchedMovies.length / ITEMS_PER_PAGE) || 1;
        setTotalPages(calculatedTotalPages);

        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const paginatedMovies = fetchedMovies.slice(startIndex, startIndex + ITEMS_PER_PAGE);
        const localizedMovies = await localizeMovies(
          paginatedMovies,
          language as MovieFilterParams['language']
        );

        setMovies(localizedMovies);
      } else {
        const params: MovieFilterParams = {
          page,
          mediaType,
          genreId: selectedGenreId,
          year: selectedYear,
          sortBy: 'popularity.desc',
          query: searchQuery.trim() || undefined,
          language: language as MovieFilterParams['language'],
        };

        const data = await tmdbApi.getMovies(params);

        const counts = await supabaseService.getFavoriteCounts(data.movies.map((m) => m.id));
        const moviesWithCounts = data.movies.map((m) => ({
          ...m,
          favoriteCount: counts[m.id] ?? 0,
        }));

        setMovies(moviesWithCounts);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Failed to load movies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, mediaType, selectedGenreId, selectedYear, viewMode, searchQuery, language]);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  return {
    movies,
    isLoading,
    mediaType,
    handleMediaTypeChange,
    selectedGenreId,
    setSelectedGenreId,
    selectedYear,
    setSelectedYear,
    viewMode,
    setViewMode,
    page,
    setPage,
    totalPages,
  };
};
