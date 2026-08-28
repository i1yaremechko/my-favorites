import { lazy, Suspense } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

import { Comments } from '@/components/Comments';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Modal } from '@/components/Modal';
import { PlatformSearchLinks } from '@/components/PlatformSearchLinks';
import { WatchProviders } from '@/components/WatchProviders';
import { useAppController } from '@/hooks/useAppController';
import { useLanguage } from '@/hooks/useLanguage';

import styles from './index.module.scss';
import '@/styles/global.scss';

const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const Favorites = lazy(() =>
  import('./pages/Favorites').then((m) => ({ default: m.Favorites }))
);
const Support = lazy(() => import('./pages/Support').then((m) => ({ default: m.Support })));

export function App() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const {
    searchQuery,
    setSearchQuery,
    user,
    favorites,
    favoritesIds,
    isFavoritesLoading,
    selectedMovie,
    isModalOpen,
    setIsModalOpen,
    telegramAuthError,
    activeTab,
    handleTabChange,
    handleRequestLogin,
    handleLogout,
    handleToggleFavorite,
    handleSelectMovie,
  } = useAppController();

  return (
    <div className={styles.appContainer}>
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

      <main className={styles.mainContent}>
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
          <div className={styles.modalContent}>
            {selectedMovie.backdropPath && (
              <img
                src={selectedMovie.backdropPath}
                alt={selectedMovie.title}
                className={styles.backdropImage}
              />
            )}
            <p className={styles.overviewText}>
              {selectedMovie.overview || t('noOverview')}
            </p>
            <div className={styles.metaInfo}>
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