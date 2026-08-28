import type { MediaType } from '@/types/movie';

export const MIN_YEAR = 1900;

export type ViewMode = 'catalog' | 'discover';

export interface FiltersProps {
  mediaType: MediaType;
  onMediaTypeChange: (type: MediaType) => void;
  selectedGenreId?: number;
  onGenreChange: (genreId?: number) => void;
  selectedYear?: number;
  onYearChange: (year?: number) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}
