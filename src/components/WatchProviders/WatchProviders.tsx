import { useEffect, useState } from 'react';

import { useLanguage } from '@/hooks/useLanguage';
import { tmdbApi } from '@/services/tmdbApi';
import type { MediaType, WatchProvider, WatchProvidersResult } from '@/types/movie';

import styles from './WatchProviders.module.scss';

interface WatchProvidersProps {
  movieId: number;
  mediaType: MediaType;
}

interface ProviderRowProps {
  providers: WatchProvider[];
  attributionLink: string | null;
}

const ProviderRow: React.FC<ProviderRowProps> = ({ providers, attributionLink }) => (
  <div className={styles.logosRow}>
    {providers.map((provider) => (
      <a
        key={provider.providerId}
        href={attributionLink ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.providerLink}
        title={provider.providerName}
      >
        <img src={provider.logoUrl} alt={provider.providerName} className={styles.logo} />
      </a>
    ))}
  </div>
);

export const WatchProviders: React.FC<WatchProvidersProps> = ({ movieId, mediaType }) => {
  const { t } = useLanguage();
  const [result, setResult] = useState<WatchProvidersResult | null>(null);

  useEffect(() => {
    let isMounted = true;
    setResult(null);

    tmdbApi
      .getWatchProviders(movieId, mediaType)
      .then((data) => {
        if (isMounted) setResult(data);
      })
      .catch((err) => {
        console.error('Failed to load viewing data:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [movieId, mediaType]);

  if (!result) return null;

  const { paidProviders, freeProviders, attributionLink } = result;

  return (
    <div className={styles.watchProviders}>
      {paidProviders.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.title}>{t('watchPaidTitle')}</h4>
          <ProviderRow providers={paidProviders} attributionLink={attributionLink} />
        </div>
      )}

      <div className={styles.section}>
        <h4 className={styles.title}>{t('watchFreeTitle')}</h4>
        {freeProviders.length > 0 ? (
          <ProviderRow providers={freeProviders} attributionLink={attributionLink} />
        ) : (
          <p className={styles.emptyPrompt}>{t('watchFreeEmptyPrompt')}</p>
        )}
      </div>

      {attributionLink && (paidProviders.length > 0 || freeProviders.length > 0) && (
        <a
          href={attributionLink}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.attribution}
        >
          {t('watchFreeAttribution')}
        </a>
      )}
    </div>
  );
};