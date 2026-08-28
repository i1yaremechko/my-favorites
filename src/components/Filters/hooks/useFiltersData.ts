import { useEffect, useMemo, useState } from 'react';

import { useLanguage } from '@/hooks/useLanguage';
import { tmdbApi } from '@/services/tmdbApi';
import type { Genre, MediaType } from '@/types/movie';

import { generateYearsList } from '../utils';

export const useFiltersData = (mediaType: MediaType) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const { language } = useLanguage();
  const years = useMemo(() => generateYearsList(), []);

  useEffect(() => {
    tmdbApi
      .getGenres(mediaType, language)
      .then((data) => setGenres(data))
      .catch((err) => console.error('Could not load genres:', err));
  }, [mediaType, language]);

  return { genres, years };
};
