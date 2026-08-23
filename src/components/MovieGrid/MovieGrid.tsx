import { useLanguage } from '@/hooks/useLanguage';
import type { Movie } from '@/types/movie';
import { MovieCard } from '../MovieCard/MovieCard';

import styles from './MovieGrid.module.scss';

interface MovieGridProps {
  movies: Movie[];
  favoritesIds?: number[];
  onToggleFavorite?: (movie: Movie) => void;
  onSelectMovie?: (movie: Movie) => void;
  isLoading?: boolean;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  favoritesIds = [],
  onToggleFavorite,
  onSelectMovie,
  isLoading = false,
}) => {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className={styles.messageContainer}>
        <p className={styles.message}>{t('loadingContent')}</p>
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className={styles.messageContainer}>
        <p className={styles.message}>{t('nothingFound')}</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          isFavorite={favoritesIds.includes(movie.id)}
          onToggleFavorite={onToggleFavorite}
          onSelectMovie={onSelectMovie}
        />
      ))}
    </div>
  );
};