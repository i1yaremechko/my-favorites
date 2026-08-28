import { useLanguage } from '@/hooks/useLanguage';
import { MovieCard } from '../MovieCard';

import type { Movie } from '@/types/movie';

import styles from './index.module.scss';

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
      <div className="messageContainer">
        <p className="message">{t('loadingContent')}</p>
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="messageContainer">
        <p className="message">{t('nothingFound')}</p>
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