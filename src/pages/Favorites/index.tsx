import { Filters } from '@/components/Filters';
import { MovieGrid } from '@/components/MovieGrid';
import { useLanguage } from '@/hooks/useLanguage';
import { useFavoritesFilter } from './hooks/useFavoritesFilter';

import type { Movie } from '@/types/movie';

import styles from './index.module.scss';

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

  const {
    mediaType,
    handleMediaTypeChange,
    selectedGenreId,
    setSelectedGenreId,
    selectedYear,
    setSelectedYear,
    filteredFavorites,
  } = useFavoritesFilter(favoriteMovies);

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