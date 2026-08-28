import { useCallback, useMemo, useState } from 'react';
import type { MediaType, Movie } from '@/types/movie';

export const useFavoritesFilter = (favoriteMovies: Movie[]) => {
  const [mediaType, setMediaType] = useState<MediaType>('movie');
  const [selectedGenreId, setSelectedGenreId] = useState<number | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

  const handleMediaTypeChange = useCallback((type: MediaType) => {
    setMediaType(type);
    setSelectedGenreId(undefined);
  }, []);

  const filteredFavorites = useMemo(() => {
    let result = favoriteMovies.filter((m) => m.mediaType === mediaType);

    if (selectedGenreId) {
      result = result.filter((m) => m.genreIds?.includes(selectedGenreId));
    }

    if (selectedYear) {
      result = result.filter((m) => {
        if (!m.releaseDate) return false;
        return new Date(m.releaseDate).getFullYear() === selectedYear;
      });
    }

    return result;
  }, [favoriteMovies, mediaType, selectedGenreId, selectedYear]);

  return {
    mediaType,
    handleMediaTypeChange,
    selectedGenreId,
    setSelectedGenreId,
    selectedYear,
    setSelectedYear,
    filteredFavorites,
  };
};
