import { useEffect, useState } from 'react';

import { useLanguage } from '@/hooks/useLanguage';
import { LANGUAGE_LABELS, LANGUAGES } from '@/types/language';
import { isTelegramMiniApp } from '@/utils/telegram';
import type { Tab } from '@/types/tab';

import styles from './index.module.scss';

interface HeaderProps {
  onSearch: (query: string) => void;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  displayName?: string | null;
  avatarUrl?: string | null;
  onLogin?: () => void;
  onLogout?: () => void;
  telegramAuthError?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  activeTab,
  onTabChange,
  displayName,
  avatarUrl,
  onLogin,
  onLogout,
  telegramAuthError,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onSearch(searchValue);
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [searchValue, onSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div
          className={styles.logo}
          role="button"
          tabIndex={0}
          onClick={() => onTabChange('home')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onTabChange('home');
            }
          }}
        >
          🎬 <span className={styles.logoText}>Favorite5</span>
        </div>

        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t('searchPlaceholder')}
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>

        <nav className={styles.nav}>
          <button
            type="button"
            className={`${styles.navBtn} ${activeTab === 'home' ? styles.active : ''}`}
            onClick={() => onTabChange('home')}
          >
            {t('navHome')}
          </button>
          <button
            type="button"
            className={`${styles.navBtn} ${activeTab === 'favorites' ? styles.active : ''}`}
            onClick={() => onTabChange('favorites')}
          >
            My-Favorite5
          </button>
        </nav>

        <div className={styles.authContainer}>
          <div className={styles.langSwitch} role="group" aria-label="Language">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                className={`${styles.langBtn} ${language === lang ? styles.active : ''}`}
                onClick={() => setLanguage(lang)}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>

          {displayName ? (
            <div className={styles.userProfile}>
              {avatarUrl && <img src={avatarUrl} alt="" className={styles.userAvatar} />}
              <span className={styles.userEmail} title={displayName}>
                {displayName}
              </span>
              <button type="button" className={styles.authBtn} onClick={onLogout}>
                {t('logout')}
              </button>
            </div>
          ) : isTelegramMiniApp() ? (
            <button
              type="button"
              className={styles.authBtn}
              onClick={onLogin}
              title={telegramAuthError ?? undefined}
            >
              {telegramAuthError ? `${t('connectingTelegramError')} ↻` : t('connectingTelegram')}
            </button>
          ) : (
            <button type="button" className={styles.authBtn} onClick={onLogin}>
              {t('loginGoogle')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};