import { useEffect, useMemo, useState } from 'react';

import { useLanguage } from '@/hooks/useLanguage';
import { tmdbApi } from '@/services/tmdbApi';
import type { Genre, MediaType } from '@/types/movie';

import styles from './Filters.module.scss';

export type ViewMode = 'catalog' | 'discover';

interface FiltersProps {
  mediaType: MediaType;
  onMediaTypeChange: (type: MediaType) => void;
  selectedGenreId?: number;
  onGenreChange: (genreId?: number) => void;
  selectedYear?: number;
  onYearChange: (year?: number) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

const MIN_YEAR = 1900;

export const Filters: React.FC<FiltersProps> = ({
  mediaType,
  onMediaTypeChange,
  selectedGenreId,
  onGenreChange,
  selectedYear,
  onYearChange,
  viewMode,
  onViewModeChange,
}) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const { language, t } = useLanguage();

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - MIN_YEAR + 1 }, (_, i) => currentYear - i);
  }, []);

  useEffect(() => {
    tmdbApi
      .getGenres(mediaType, language)
      .then((data) => setGenres(data))
      .catch((err) => console.error('Could not load genres:', err));
  }, [mediaType, language]);

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filterGroup}>
        <div className={styles.mediaTypeSwitch}>
          <button
            type="button"
            className={`${styles.switchBtn} ${mediaType === 'movie' ? styles.active : ''}`}
            onClick={() => onMediaTypeChange('movie')}
          >
            {t('filterMovies')}
          </button>
          <button
            type="button"
            className={`${styles.switchBtn} ${mediaType === 'tv' ? styles.active : ''}`}
            onClick={() => onMediaTypeChange('tv')}
          >
            {t('filterTv')}
          </button>
        </div>

        <select
          className={`${styles.select} ${styles.desktopOnly}`}
          value={selectedGenreId || ''}
          onChange={(e) => onGenreChange(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">{t('allGenres')}</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>

        <select
          className={`${styles.select} ${styles.desktopOnly}`}
          value={selectedYear || ''}
          onChange={(e) => onYearChange(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">{t('allYears')}</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
              {t('yearOptionSuffix')}
            </option>
          ))}
        </select>

        <div className={styles.mobileFilterGroup}>
          <div className={styles.chipScroll} role="group" aria-label={t('allGenres')}>
            <button
              type="button"
              className={`${styles.chip} ${selectedGenreId === undefined ? styles.active : ''}`}
              onClick={() => onGenreChange(undefined)}
            >
              {t('allGenres')}
            </button>
            {genres.map((genre) => (
              <button
                key={genre.id}
                type="button"
                className={`${styles.chip} ${selectedGenreId === genre.id ? styles.active : ''}`}
                onClick={() => onGenreChange(genre.id)}
              >
                {genre.name}
              </button>
            ))}
          </div>

          <div className={styles.chipScroll} role="group" aria-label={t('allYears')}>
            <button
              type="button"
              className={`${styles.chip} ${selectedYear === undefined ? styles.active : ''}`}
              onClick={() => onYearChange(undefined)}
            >
              {t('allYears')}
            </button>
            {years.map((year) => (
              <button
                key={year}
                type="button"
                className={`${styles.chip} ${selectedYear === year ? styles.active : ''}`}
                onClick={() => onYearChange(year)}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {viewMode && onViewModeChange && (
          <button
            type="button"
            className={`${styles.switchBtn} ${viewMode === 'discover' ? styles.active : ''}`}
            onClick={() => onViewModeChange(viewMode === 'catalog' ? 'discover' : 'catalog')}
          >
            {viewMode === 'discover' ? t('viewModeDiscoverActive') : t('viewModeDiscoverInactive')}
          </button>
        )}
      </div>
    </div>
  );
};