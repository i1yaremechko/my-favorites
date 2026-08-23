import { useCallback, useEffect, useState } from 'react';

import { Filters, type ViewMode } from '@/components/Filters/Filters';
import { MovieGrid } from '@/components/MovieGrid/MovieGrid';
import { Pagination } from '@/components/Pagination/Pagination';
import { useLanguage } from '@/hooks/useLanguage';
import { supabaseService } from '@/services/supabaseClient';
import { tmdbApi } from '@/services/tmdbApi';
import type { Movie, MediaType, MovieFilterParams } from '@/types/movie';
import { localizeMovies } from '@/utils/localizeMovies';

import styles from './Home.module.scss';

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
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mediaType, setMediaType] = useState<MediaType>('movie');
  const [selectedGenreId, setSelectedGenreId] = useState<number | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>('catalog');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const handleMediaTypeChange = useCallback((type: MediaType) => {
    setMediaType(type);
    setSelectedGenreId(undefined);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [mediaType, selectedGenreId, selectedYear, viewMode, searchQuery, language]);

  const loadMovies = useCallback(async () => {
    setIsLoading(true);
    try {
      if (viewMode === 'catalog') {
        let fetchedMovies = await supabaseService.getAllFavorites();

        fetchedMovies = fetchedMovies.filter((m) => m.mediaType === mediaType);

        if (selectedGenreId) {
          fetchedMovies = fetchedMovies.filter((m) => m.genreIds?.includes(selectedGenreId));
        }

        if (selectedYear) {
          fetchedMovies = fetchedMovies.filter((m) => {
            if (!m.releaseDate) return false;
            const movieYear = new Date(m.releaseDate).getFullYear();
            return movieYear === selectedYear;
          });
        }

        fetchedMovies = await localizeMovies(fetchedMovies, language);

        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          fetchedMovies = fetchedMovies.filter((m) => m.title.toLowerCase().includes(query));
        }

        fetchedMovies.sort((a, b) => b.favoriteCount - a.favoriteCount);

        setMovies(fetchedMovies);
        setTotalPages(1);
      } else {
        const params: MovieFilterParams = {
          page,
          mediaType,
          genreId: selectedGenreId,
          year: selectedYear,
          sortBy: 'popularity.desc',
          query: searchQuery.trim() || undefined,
          language,
        };

        const data = await tmdbApi.getMovies(params);
        setMovies(data.movies);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Movie download error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, mediaType, selectedGenreId, selectedYear, viewMode, searchQuery, language]);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

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

      {viewMode === 'discover' && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage) => {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
};