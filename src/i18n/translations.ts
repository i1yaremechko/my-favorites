import type { Language } from '../types/language';

export const translations = {
  // Header
  searchPlaceholder: { uk: 'Пошук фільмів або серіалів...', en: 'Search movies or TV shows...' },
  navHome: { uk: 'Головна', en: 'Home' },
  loginGoogle: { uk: 'Увійти через Google', en: 'Sign in with Google' },
  connectingTelegram: { uk: 'Підключення через Telegram...', en: 'Connecting via Telegram...' },
  connectingTelegramError: {
    uk: 'Помилка входу — спробувати ще раз',
    en: 'Sign-in failed — tap to retry',
  },
  logout: { uk: 'Вийти', en: 'Log out' },

  // Filters
  filterMovies: { uk: 'Фільми', en: 'Movies' },
  filterTv: { uk: 'Серіали', en: 'TV Shows' },
  allGenres: { uk: 'Усі жанри', en: 'All genres' },
  allYears: { uk: 'Усі роки', en: 'All years' },
  yearOptionSuffix: { uk: ' рік', en: '' }, // e.g. "2024 рік" vs "2024"
  viewModeDiscoverActive: { uk: 'Режим: Всі', en: 'Mode: All' },
  viewModeDiscoverInactive: { uk: 'Всі', en: 'All' },

  // Movie grid / card
  loadingContent: { uk: 'Завантаження контенту...', en: 'Loading content...' },
  nothingFound: { uk: 'Нічого не знайдено', en: 'Nothing found' },
  mediaTypeMovie: { uk: 'Фільм', en: 'Movie' },
  mediaTypeTv: { uk: 'Серіал', en: 'TV Show' },
  noPosterAvailable: { uk: 'Зображення відсутнє', en: 'No image available' },
  addToFavorites: { uk: 'Додати в улюблені', en: 'Add to favorites' },
  favoriteCountTitle: {
    uk: 'Кількість додавань у вподобані',
    en: 'Number of times added to favorites',
  },
  hoursShort: { uk: 'г', en: 'h' },
  minutesShort: { uk: 'хв', en: 'min' },

  // Pagination
  paginationBack: { uk: '← Назад', en: '← Back' },
  paginationNext: { uk: 'Вперед →', en: 'Next →' },

  // Pages
  favoritesTitle: {
    uk: '❤️ Мої улюблені фільми та серіали',
    en: '❤️ My favorite movies & TV shows',
  },

  // Modal (movie details) & app-level
  modalClose: { uk: 'Закрити', en: 'Close' },
  ratingLabel: { uk: 'Рейтинг', en: 'Rating' },
  yearLabel: { uk: 'Рік', en: 'Year' },
  durationLabel: { uk: 'Тривалість', en: 'Duration' },
  noOverview: { uk: 'Опис відсутній', en: 'No description available' },
  loginRequiredAlert: {
    uk: 'Будь ласка, увійдіть у систему, щоб додавати фільми в улюблені.',
    en: 'Please sign in to add movies to your favorites.',
  },

  // Trailer
  watchTrailer: { uk: '🎬 Дивитися трейлер', en: '🎬 Watch Trailer' },
  loadingTrailer: { uk: 'Завантаження...', en: 'Loading...' },
  trailerNotFoundAlert: {
    uk: 'На жаль, для цього фільму/серіалу трейлер не знайдено.',
    en: 'Unfortunately, no trailer was found for this movie/series.',
  },
  trailerModalTitle: { uk: 'Трейлер', en: 'Trailer' },

  // Watch providers (платно / безкоштовно)
  watchPaidTitle: { uk: 'Де подивитися платно', en: 'Where to watch (paid)' },
  watchFreeTitle: { uk: 'Де подивитися безплатно', en: 'Where to watch (free)' },
  watchFreeAttribution: {
    uk: 'Дані: JustWatch · Переглянути всі варіанти',
    en: 'Data: JustWatch · View all options',
  },

  // Пошук на українських платформах (unverified deep-link search, не TMDB-дані)
  searchPlatformsTitle: {
    uk: 'Пошук на українських платформах',
    en: 'Search on Ukrainian platforms',
  },
  searchPlatformsHint: {
    uk: 'Ці кнопки відкривають пошук за назвою — наявність фільму на платформі не гарантована',
    en: "These buttons open a search by title — availability on the platform isn't guaranteed",
  },
  watchFreeEmptyPrompt: {
    uk: 'Офіційних безкоштовних варіантів не знайдено. Знаєте, де подивитись? Напишіть у коментарях нижче 👇',
    en: 'No official free options found. Know where to watch it? Let others know in the comments below 👇',
  },

  // Коментарі
  commentsTitle: { uk: 'Коментарі', en: 'Comments' },
  commentsPlaceholder: {
    uk: 'Поділіться враженнями або посиланням, де дивились...',
    en: 'Share your thoughts or a link to where you watched it...',
  },
  commentsSubmit: { uk: 'Надіслати', en: 'Post' },
  commentsEmpty: {
    uk: 'Ще немає коментарів. Будьте першим!',
    en: 'No comments yet. Be the first!',
  },
  commentsLoginPrompt: { uk: 'Увійдіть, щоб залишити коментар', en: 'Sign in to leave a comment' },
  commentsDelete: { uk: 'Видалити', en: 'Delete' },

  // Footer
  footerDescription: {
    uk: 'Каталог фільмів та серіалів на базі TMDB API.',
    en: 'A movie & TV show catalog powered by the TMDB API.',
  },
  footerMade: {
    uk: 'Зроблено з любов’ю до кіно та веб-розробки.',
    en: 'Made with love for cinema and web development.',
  },
  footerSupportLink: { uk: '💛 Подякувати розробникам', en: '💛 Support the developers' },

  // Support page
  supportTitle: { uk: 'Підтримка та зворотний зв\u2019язок', en: 'Support & feedback' },
  feedbackTitle: { uk: 'Зворотний зв\u2019язок', en: 'Feedback' },
  feedbackHint: {
    uk: 'Питання, пропозиції, знайшли баг, чи просто хочете подякувати словом — пишіть тут.',
    en: 'Questions, suggestions, bug reports, or just a thank-you note — write here.',
  },
  feedbackNamePlaceholder: { uk: 'Ім\u2019я (необов\u2019язково)', en: 'Name (optional)' },
  feedbackEmailPlaceholder: { uk: 'Email (необов\u2019язково)', en: 'Email (optional)' },
  feedbackMessagePlaceholder: { uk: 'Ваше повідомлення...', en: 'Your message...' },
  feedbackSubmit: { uk: 'Надіслати', en: 'Send' },
  feedbackSending: { uk: 'Надсилаємо...', en: 'Sending...' },
  feedbackSuccess: { uk: 'Дякуємо! Повідомлення надіслано.', en: 'Thank you! Message sent.' },
  feedbackError: {
    uk: 'Не вдалося надіслати. Спробуйте ще раз пізніше.',
    en: 'Failed to send. Please try again later.',
  },
  donateTitle: { uk: 'Підтримати розробників', en: 'Support the developers' },
  donateHint: {
    uk: 'Якщо застосунок був корисним і хочете підтримати розробку — буде дуже приємно 💛',
    en: "If the app was useful and you'd like to support development — it would mean a lot 💛",
  },

  supportPrivatLabel: {
    uk: 'Конверт ПриватБанку',
    en: 'PrivatBank Jar',
  },
  supportPrivatDesc: {
    uk: 'Зручно для карток ПриватБанку та інших українських банків',
    en: 'Convenient for PrivatBank and other Ukrainian cards',
  },
} satisfies Record<string, Record<Language, string>>;

export type TranslationKey = keyof typeof translations;
