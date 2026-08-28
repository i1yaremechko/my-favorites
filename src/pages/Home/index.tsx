import { Filters } from '@/components/Filters';
import { MovieGrid } from '@/components/MovieGrid';
import { Pagination } from '@/components/Pagination';
import { useLanguage } from '@/hooks/useLanguage';
import { useHomeMovies } from './hooks/useHomeMovies';
import type { Movie } from '@/types/movie';

import styles from './index.module.scss';

interface HomeProps {
  searchQuery: string;
  favoritesIds: number[];
  onToggleFavorite: (movie: Movie) => void;
  onSelectMovie: (movie: Movie) => void;
}

export const Home: React.FC<HomeProps> = ({
  searchQuery,
  favoritesIds,
  onToggleFavorite,
  onSelectMovie,
}) => {
  const { language } = useLanguage();

  const {
    movies,
    isLoading,
    mediaType,
    handleMediaTypeChange,
    selectedGenreId,
    setSelectedGenreId,
    selectedYear,
    setSelectedYear,
    viewMode,
    setViewMode,
    page,
    setPage,
    totalPages,
  } = useHomeMovies({ searchQuery, language });

  return (
    <div className={styles.homePage}>
      <Filters
        mediaType={mediaType}
        onMediaTypeChange={handleMediaTypeChange}
        selectedGenreId={selectedGenreId}
        onGenreChange={setSelectedGenreId}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <MovieGrid
        movies={movies}
        favoritesIds={favoritesIds}
        onToggleFavorite={onToggleFavorite}
        onSelectMovie={onSelectMovie}
        isLoading={isLoading}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(newPage) => {
          setPage(newPage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
};