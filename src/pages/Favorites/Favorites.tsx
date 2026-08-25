import React, { useCallback, useMemo, useState } from 'react';

import { Filters } from '@/components/Filters/Filters';
import { MovieGrid } from '@/components/MovieGrid/MovieGrid';
import { useLanguage } from '@/hooks/useLanguage';
import type { Movie, MediaType } from '@/types/movie';

import styles from './Favorites.module.scss';

interface FavoritesProps {
  favoriteMovies: Movie[];
  favoritesIds: number[];
  onToggleFavorite: (movie: Movie) => void;
  onSelectMovie: (movie: Movie) => void;
  isLoading: boolean;
}

export const Favorites: React.FC<FavoritesProps> = ({
  favoriteMovies,
  favoritesIds,
  onToggleFavorite,
  onSelectMovie,
  isLoading,
}) => {
  const { t } = useLanguage();
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

  return (
    <div className={styles.favoritesPage}>
      <h2 className={styles.title}>{t('favoritesTitle')}</h2>

      <Filters
        mediaType={mediaType}
        onMediaTypeChange={handleMediaTypeChange}
        selectedGenreId={selectedGenreId}
        onGenreChange={setSelectedGenreId}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />

      <MovieGrid
        movies={filteredFavorites}
        favoritesIds={favoritesIds}
        onToggleFavorite={onToggleFavorite}
        onSelectMovie={onSelectMovie}
        isLoading={isLoading}
      />
    </div>
  );
};