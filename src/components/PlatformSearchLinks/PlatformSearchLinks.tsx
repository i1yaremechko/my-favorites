import React from 'react';

import { UKRAINIAN_PLATFORMS, getPlatformFaviconUrl } from '@/config/externalPlatforms';
import { useLanguage } from '@/hooks/useLanguage';

import styles from './PlatformSearchLinks.module.scss';

interface PlatformSearchLinksProps {
  title: string;
}

export const PlatformSearchLinks: React.FC<PlatformSearchLinksProps> = ({ title }) => {
  const { t } = useLanguage();

  return (
    <div className={styles.platformSearchLinks}>
      <h4 className={styles.title}>{t('searchPlatformsTitle')}</h4>

      <div className={styles.logosRow}>
        {UKRAINIAN_PLATFORMS.map((platform) => (
          <a
            key={platform.id}
            href={platform.buildSearchUrl(title)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.platformLink}
            title={platform.name}
          >
            <img
              src={getPlatformFaviconUrl(platform.domain)}
              alt={platform.name}
              className={styles.logo}
            />
            <span className={styles.name}>{platform.name}</span>
          </a>
        ))}
      </div>

      <p className={styles.hint}>{t('searchPlatformsHint')}</p>
    </div>
  );
};
