import type { WatchProvider } from '@/types/movie';

import styles from './index.module.scss';

interface ProviderRowProps {
  providers: WatchProvider[];
  attributionLink: string | null;
}

export const ProviderRow: React.FC<ProviderRowProps> = ({ providers, attributionLink }) => (
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