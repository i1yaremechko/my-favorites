import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { tmdbApi } from '@/services/tmdbApi';
import type { Movie } from '@/types/movie';
import { formatRuntime, getReleaseYear } from './utils';
import { TrailerModal } from '../TrailerModal';

import styles from './index.module.scss';

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
  const { t, language } = useLanguage();
  const favoriteCount = movie.favoriteCount ?? 0;

  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);

  const releaseYear = getReleaseYear(movie.releaseDate);
  const formattedRuntime = formatRuntime(movie.runtime, t('hoursShort'), t('minutesShort'));

  const handleOpenTrailer = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoadingTrailer(true);
    try {
      const key = await tmdbApi.getMovieTrailer(movie.id, movie.mediaType, language);
      if (key) {
        setTrailerKey(key);
        setIsTrailerOpen(true);
      } else {
        alert(t('trailerNotFoundAlert'));
      }
    } catch (error) {
      console.error('Error occurred while loading the trailer:', error);
    } finally {
      setIsLoadingTrailer(false);
    }
  };

  return (
    <>
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
            {formattedRuntime && <span className={styles.runtime}>{formattedRuntime}</span>}
          </div>

          <button
            type="button"
            className={styles.trailerBtn}
            onClick={handleOpenTrailer}
            disabled={isLoadingTrailer}
            style={{
              marginTop: '8px',
              width: '100%',
              padding: '6px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.85rem',
              transition: 'background 0.2s',
            }}
          >
            {isLoadingTrailer ? t('loadingTrailer') : t('watchTrailer')}
          </button>
        </div>
      </div>

      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        videoKey={trailerKey}
      />
    </>
  );
};