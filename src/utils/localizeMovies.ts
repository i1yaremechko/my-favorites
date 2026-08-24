import { tmdbApi } from '../services/tmdbApi';
import type { Language } from '../types/language';
import type { Movie } from '../types/movie';

// Записи улюблених у Supabase зберігають title/overview тією мовою, яка була
// активна в момент додавання фільму в улюблені (текст "заморожений" у БД).
// Тому при перемиканні мови інтерфейсу назви фільмів з каталогу/улюблених
// самі по собі не змінюються. Цей кеш + функція нижче підтягують актуальну
// локалізовану версію напряму з TMDB за id фільму.
const detailsCache = new Map<string, Movie>();

const cacheKey = (id: number, mediaType: Movie['mediaType'], language: Language) =>
  `${language}:${mediaType}:${id}`;

// Обмежуємо кількість одночасних запитів до TMDB, щоб не влаштовувати "залп"
// з десятків паралельних fetch-ів при завантаженні великого каталогу улюблених.
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  const worker = async () => {
    while (cursor < items.length) {
      const current = cursor;
      cursor += 1;
      results[current] = await fn(items[current]);
    }
  };

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);

  return results;
}

// Підтягує локалізовані title/overview (та інші мовозалежні поля) з TMDB для
// кожного фільму, зберігаючи Supabase-специфічні поля на кшталт favoriteCount.
export async function localizeMovies<T extends Movie>(
  movies: T[],
  language: Language
): Promise<T[]> {
  return mapWithConcurrency(movies, 6, async (movie) => {
    const key = cacheKey(movie.id, movie.mediaType, language);
    let details = detailsCache.get(key);

    if (!details) {
      try {
        details = await tmdbApi.getDetails(movie.id, movie.mediaType, language);
        detailsCache.set(key, details);
      } catch (err) {
        console.error('Не вдалося підтягнути локалізовані дані з TMDB:', err);
        return movie; // TMDB недоступний — показуємо те, що вже маємо
      }
    }

    return {
      ...movie,
      title: details.title || movie.title,
      originalTitle: details.originalTitle ?? movie.originalTitle,
      overview: details.overview || movie.overview,
      posterPath: details.posterPath ?? movie.posterPath,
      backdropPath: details.backdropPath ?? movie.backdropPath,
      genreIds: details.genreIds.length ? details.genreIds : movie.genreIds,
      runtime: details.runtime ?? movie.runtime,
      voteAverage: details.voteAverage ?? movie.voteAverage,
    };
  });
}
