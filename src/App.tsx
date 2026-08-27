import type { User } from '@supabase/supabase-js';
import { lazy, Suspense, useEffect, useState, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import { Comments } from './components/Comments/Comments';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { Modal } from './components/Modal/Modal';
import { PlatformSearchLinks } from './components/PlatformSearchLinks/PlatformSearchLinks';
import { WatchProviders } from './components/WatchProviders/WatchProviders';
import { useLanguage } from './hooks/useLanguage';
import { supabaseService, supabase } from './services/supabaseClient';
import { signInWithTelegram } from './services/telegramAuth';
import { tmdbApi } from './services/tmdbApi';
import type { Movie } from './types/movie';
import type { Tab } from './types/tab';
import { localizeMovies } from './utils/localizeMovies';
import { getTelegramWebApp, isTelegramMiniApp } from './utils/telegram';
import './styles/global.scss';

// Route-level code splitting
const Home = lazy(() => import('./pages/Home/Home').then((m) => ({ default: m.Home })));
const Favorites = lazy(() =>
  import('./pages/Favorites/Favorites').then((m) => ({ default: m.Favorites }))
);
const Support = lazy(() => import('./pages/Support/Support').then((m) => ({ default: m.Support })));

interface AppUser {
  id: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string | null;
  isTelegram: boolean;
}

function buildAppUser(authUser: User | null): AppUser | null {
  if (!authUser) return null;

  const metadata = authUser.user_metadata ?? {};
  const isTelegram = metadata.provider === 'telegram';

  return {
    id: authUser.id,
    email: authUser.email,
    displayName: isTelegram ? (metadata.full_name as string | undefined) : authUser.email,
    avatarUrl: isTelegram ? ((metadata.avatar_url as string | null) ?? null) : null,
    isTelegram,
  };
}

export function App() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [user, setUser] = useState<AppUser | null>(null);

  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [favoritesIds, setFavoritesIds] = useState<number[]>([]);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState<boolean>(false);

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [telegramAuthError, setTelegramAuthError] = useState<string | null>(null);

  // Визначаємо активну вкладку на основі поточного шляху роутера
  const activeTab: Tab = location.pathname === '/favorites' ? 'favorites' : location.pathname === '/support' ? 'support' : 'home';

  const handleTabChange = (tab: Tab) => {
    if (tab === 'favorites') {
      navigate('/favorites');
    } else if (tab === 'support') {
      navigate('/support');
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    const webApp = getTelegramWebApp();
    if (webApp) {
      webApp.ready();
      webApp.expand();
    }

    const bootstrapAuth = async () => {
      const currentUser = await supabaseService.getCurrentUser();

      if (currentUser) {
        setUser(buildAppUser(currentUser));
        return;
      }

      if (isTelegramMiniApp()) {
        try {
          await signInWithTelegram();
          setTelegramAuthError(null);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error('Failed to automatically log in via Telegram:', error);
          setTelegramAuthError(message);
          getTelegramWebApp()?.showAlert(`Telegram auth error: ${message}`);
        }
      }
    };

    bootstrapAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(buildAppUser(session?.user ?? null));
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setFavoritesIds([]);
      return;
    }

    setIsFavoritesLoading(true);
    try {
      const data = await supabaseService.getFavorites(user.id);
      const localized = await localizeMovies(data, language);
      setFavorites(localized);
      setFavoritesIds(localized.map((m) => m.id));
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsFavoritesLoading(false);
    }
  }, [user, language]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleLogin = async () => {
    try {
      await supabaseService.signInWithGoogle();
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleRequestLogin = async () => {
    if (isTelegramMiniApp()) {
      try {
        await signInWithTelegram();
        setTelegramAuthError(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Failed to re-authorize via Telegram:', error);
        setTelegramAuthError(message);
        getTelegramWebApp()?.showAlert(`Telegram auth error: ${message}`);
      }
      return;
    }

    await handleLogin();
  };

  const handleLogout = async () => {
    try {
      await supabaseService.signOut();
      setUser(null);
      setFavorites([]);
      setFavoritesIds([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleToggleFavorite = async (movie: Movie) => {
    if (!user) {
      alert(t('loginRequiredAlert'));
      handleRequestLogin();
      return;
    }

    const isFav = favoritesIds.includes(movie.id);

    try {
      if (isFav) {
        await supabaseService.removeFavorite(user.id, movie.id);
        setFavoritesIds((prev) => prev.filter((id) => id !== movie.id));
        setFavorites((prev) => prev.filter((m) => m.id !== movie.id));
      } else {
        await supabaseService.addFavorite(user.id, movie);
        setFavoritesIds((prev) => [...prev, movie.id]);
        setFavorites((prev) => [...prev, movie]);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const handleSelectMovie = async (movie: Movie) => {
    try {
      const fullDetails = await tmdbApi.getDetails(movie.id, movie.mediaType, language);
      setSelectedMovie(fullDetails);
    } catch {
      setSelectedMovie(movie);
    }
    setIsModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        onSearch={setSearchQuery}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        displayName={user?.displayName}
        avatarUrl={user?.avatarUrl}
        onLogin={handleRequestLogin}
        onLogout={handleLogout}
        telegramAuthError={telegramAuthError}
      />

      <main style={{ flex: 1, padding: '24px 16px', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
        <Suspense fallback={null}>
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  searchQuery={searchQuery}
                  favoritesIds={favoritesIds}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectMovie={handleSelectMovie}
                />
              }
            />
            <Route
              path="/favorites"
              element={
                <Favorites
                  favoriteMovies={favorites}
                  favoritesIds={favoritesIds}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectMovie={handleSelectMovie}
                  isLoading={isFavoritesLoading}
                />
              }
            />
            <Route
              path="/support"
              element={<Support currentUser={user ? { id: user.id, email: user.email } : null} />}
            />
          </Routes>
        </Suspense>
      </main>

      <Footer onSupportClick={() => navigate('/support')} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedMovie?.title}>
        {selectedMovie && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedMovie.backdropPath && (
              <img
                src={selectedMovie.backdropPath}
                alt={selectedMovie.title}
                style={{ width: '100%', borderRadius: '8px', maxHeight: '250px', objectFit: 'cover' }}
              />
            )}
            <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
              {selectedMovie.overview || t('noOverview')}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#888' }}>
              <span>
                {t('ratingLabel')}: ⭐ {selectedMovie.voteAverage.toFixed(1)}
              </span>
              <span>
                {t('yearLabel')}:{' '}
                {selectedMovie.releaseDate ? selectedMovie.releaseDate.split('-')[0] : 'N/A'}
              </span>
              {selectedMovie.runtime && (
                <span>
                  {t('durationLabel')}: {selectedMovie.runtime} {t('minutesShort')}
                </span>
              )}
            </div>

            <ErrorBoundary fallbackLabel="Where to watch section error">
              <WatchProviders movieId={selectedMovie.id} mediaType={selectedMovie.mediaType} />
            </ErrorBoundary>

            <ErrorBoundary fallbackLabel="Platforms search section error">
              <PlatformSearchLinks title={selectedMovie.title} />
            </ErrorBoundary>

            <ErrorBoundary fallbackLabel="Comment section error">
              <Comments
                movieId={selectedMovie.id}
                mediaType={selectedMovie.mediaType}
                currentUser={
                  user ? { id: user.id, displayName: user.displayName, avatarUrl: user.avatarUrl } : null
                }
                onRequestLogin={handleRequestLogin}
              />
            </ErrorBoundary>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default App;