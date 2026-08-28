import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useLanguage } from '@/hooks/useLanguage';
import { supabase, supabaseService } from '@/services/supabaseClient';
import { signInWithTelegram } from '@/services/telegramAuth';
import { tmdbApi } from '@/services/tmdbApi';
import { localizeMovies } from '@/utils/localizeMovies';
import { getTelegramWebApp, isTelegramMiniApp } from '@/utils/telegram';

import { type AppUser, buildAppUser } from '../types/user';
import type { Movie } from '@/types/movie';
import type { Tab } from '@/types/tab';

export const useAppController = () => {
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

  const activeTab: Tab =
    location.pathname === '/favorites'
      ? 'favorites'
      : location.pathname === '/support'
        ? 'support'
        : 'home';

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

  return {
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
  };
};
