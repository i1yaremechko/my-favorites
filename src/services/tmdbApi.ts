import { TMDB_LOCALES, type Language } from '@/types/language';
import type {
  Movie,
  Genre,
  MovieFilterParams,
  MediaType,
  WatchProvidersResult,
} from '@/types/movie';

const BASE_URL = 'https://api.themoviedb.org/3';

const headers = {
  accept: 'application/json',
  Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN || ''}`,
};

const mapMovieData = (item: any, typeOverride?: 'movie' | 'tv'): Movie => {
  const mediaType = typeOverride || item.media_type || (item.first_air_date ? 'tv' : 'movie');

  return {
    id: item.id,
    title: item.title || item.name || '',
    originalTitle: item.original_title || item.original_name,
    overview: item.overview || '',
    posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null,
    backdropPath: item.backdrop_path
      ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
      : null,
    releaseDate: item.release_date || item.first_air_date || '',
    voteAverage: item.vote_average || 0,
    voteCount: item.vote_count || 0,
    genreIds: item.genre_ids || item.genres?.map((g: Genre) => g.id) || [],
    mediaType,
    runtime: item.runtime || (item.episode_run_time && item.episode_run_time[0]) || null,
  };
};

export const tmdbApi = {
  async getMovies(params: MovieFilterParams): Promise<{ movies: Movie[]; totalPages: number }> {
    const mediaType = params.mediaType || 'movie';
    const locale = TMDB_LOCALES[params.language];
    let url = `${BASE_URL}/discover/${mediaType}?language=${locale}&page=${params.page}`;

    if (params.genreId) {
      url += `&with_genres=${params.genreId}`;
    }
    if (params.year) {
      const yearParam = mediaType === 'tv' ? 'first_air_date_year' : 'primary_release_year';
      url += `&${yearParam}=${params.year}`;
    }
    if (params.sortBy) {
      url += `&sort_by=${params.sortBy}`;
    }
    if (params.query) {
      const searchType = params.mediaType ? params.mediaType : 'multi';
      url = `${BASE_URL}/search/${searchType}?query=${encodeURIComponent(params.query)}&language=${locale}&page=${params.page}`;
    }

    const response = await fetch(url, {
      headers: {
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error('Помилка при завантаженні даних із сервера TMDB');
    }

    const data = await response.json();

    const rawResults = data.results || [];
    const filteredResults =
      params.query && !params.mediaType
        ? rawResults.filter(
            (item: { media_type: string }) =>
              item.media_type === 'movie' || item.media_type === 'tv'
          )
        : rawResults;

    return {
      movies: filteredResults.map((item: unknown) => mapMovieData(item, params.mediaType)),
      totalPages: data.total_pages > 500 ? 500 : data.total_pages || 1,
    };
  },

  async getDetails(
    id: number,
    mediaType: MediaType = 'movie',
    language: Language = 'uk'
  ): Promise<Movie> {
    const locale = TMDB_LOCALES[language];
    const response = await fetch(`${BASE_URL}/${mediaType}/${id}?language=${locale}`, {
      headers: {
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error('Не вдалося завантажити деталі');
    }

    const data = await response.json();
    return mapMovieData(data, mediaType);
  },

  async getGenres(mediaType: MediaType = 'movie', language: Language = 'uk'): Promise<Genre[]> {
    const locale = TMDB_LOCALES[language];
    const response = await fetch(`${BASE_URL}/genre/${mediaType}/list?language=${locale}`, {
      headers: {
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error('Не вдалося завантажити жанри');
    }

    const data = await response.json();
    return data.genres;
  },

  async getWatchProviders(
    id: number,
    mediaType: MediaType = 'movie'
  ): Promise<WatchProvidersResult> {
    const response = await fetch(`${BASE_URL}/${mediaType}/${id}/watch/providers`, {
      headers: {
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error('Не вдалося завантажити інформацію про перегляд');
    }

    const data = await response.json();
    const regionData = data.results?.UA;

    if (import.meta.env.DEV) {
      console.warn(
        `[watch-providers] ${mediaType}/${id} — available regions:`,
        Object.keys(data.results ?? {})
      );
      console.warn(`[watch-providers] ${mediaType}/${id} — UA data:`, regionData ?? '(none)');
    }

    if (!regionData) {
      return { paidProviders: [], freeProviders: [], attributionLink: null };
    }

    const dedupeProviders = (raw: any[]) => {
      const seen = new Set<number>();
      return raw
        .filter((p) => {
          if (seen.has(p.provider_id)) return false;
          seen.add(p.provider_id);
          return true;
        })
        .sort((a, b) => (a.display_priority ?? 0) - (b.display_priority ?? 0))
        .map((p) => ({
          providerId: p.provider_id,
          providerName: p.provider_name,
          logoUrl: `https://image.tmdb.org/t/p/w92${p.logo_path}`,
        }));
    };

    const paidProviders = dedupeProviders([
      ...(regionData.flatrate ?? []),
      ...(regionData.rent ?? []),
      ...(regionData.buy ?? []),
    ]);

    const freeProviders = dedupeProviders([...(regionData.free ?? []), ...(regionData.ads ?? [])]);

    return { paidProviders, freeProviders, attributionLink: regionData.link ?? null };
  },

  async getMovieTrailer(
    id: number,
    mediaType: MediaType = 'movie',
    language: Language = 'uk'
  ): Promise<string | null> {
    const locale = TMDB_LOCALES[language] || 'uk-UA';

    const fetchVideos = async (lang: string) => {
      const response = await fetch(`${BASE_URL}/${mediaType}/${id}/videos?language=${lang}`, {
        headers,
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.results || [];
    };

    try {
      let results: any[] = [];

      if (language === 'uk') {
        results = await fetchVideos(locale);
      }

      let trailer = results.find(
        (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
      );

      if (!trailer) {
        const fallbackResults = await fetchVideos('en-US');
        trailer = fallbackResults.find(
          (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        );

        if (!trailer && fallbackResults.length > 0) {
          trailer = fallbackResults.find((v: any) => v.site === 'YouTube');
        }
      }

      return trailer?.key || null;
    } catch (error) {
      console.error('Failed to load trailer:', error);
      return null;
    }
  },
};
