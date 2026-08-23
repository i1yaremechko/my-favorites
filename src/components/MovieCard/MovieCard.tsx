import { useEffect, useState } from 'react';

import { useLanguage } from '@/hooks/useLanguage';
import { supabaseService } from '@/services/supabaseClient';
import type { Movie } from '@/types/movie';

import styles from './MovieCard.module.scss';

interface MovieCardProps {
  movie: Movie;
  isFavorite?: boolean;
  onToggleFavorite?: (movie: Movie) => void;
  onSelectMovie?: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  isFavorite = false,
  onToggleFavorite,
  onSelectMovie,
}) => {
  const { t } = useLanguage();
  const [favoriteCount, setFavoriteCount] = useState<number>(movie.favoriteCount ?? 0);

  useEffect(() => {
    if (movie.favoriteCount !== undefined) {
      setFavoriteCount(movie.favoriteCount);
      return;
    }

    let isMounted = true;
    supabaseService
      .getFavoriteCount(movie.id)
      .then((count) => {
        if (isMounted) {
          setFavoriteCount(count);
        }
      })
      .catch((err) => {
        console.error('Error fetching favorite count:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [movie.id, movie.favoriteCount]);

  const releaseYear = movie.releaseDate ? movie.releaseDate.split('-')[0] : 'N/A';

  const formatRuntime = (minutes?: number | null) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0
      ? `${hours}${t('hoursShort')} ${mins}${t('minutesShort')}`
      : `${mins}${t('minutesShort')}`;
  };

  return (
    <div
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={() => onSelectMovie?.(movie)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectMovie?.(movie);
        }
      }}
    >
      <div className={styles.posterWrapper}>
        {movie.posterPath ? (
          <img src={movie.posterPath} alt={movie.title} className={styles.poster} loading="lazy" />
        ) : (
          <div className={styles.noPoster}>{t('noPosterAvailable')}</div>
        )}

        <span className={styles.mediaTypeBadge}>
          {movie.mediaType === 'tv' ? t('mediaTypeTv') : t('mediaTypeMovie')}
        </span>

        <button
          type="button"
          className={`${styles.favoriteBtn} ${isFavorite ? styles.active : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(movie);
          }}
          aria-label={t('addToFavorites')}
        >
          ❤️
        </button>
      </div>

      <div className={styles.info}>
        <div className={styles.headerRow}>
          <h3 className={styles.title} title={movie.title}>{movie.title}</h3>
          <span className={styles.rating} title={t('favoriteCountTitle')}>
            ❤️ {favoriteCount}
          </span>
        </div>

        <div className={styles.detailsRow}>
          <span className={styles.year}>{releaseYear}</span>
          {movie.runtime && <span className={styles.runtime}>{formatRuntime(movie.runtime)}</span>}
        </div>
      </div>
    </div>
  );
};