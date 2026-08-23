import { useLanguage } from '@/hooks/useLanguage';

import styles from './Footer.module.scss';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.text}>
            © {currentYear} <span className={styles.brand}>Favourite5</span>. {t('footerDescription')}
          </p>
          <p className={styles.subText}>{t('footerMade')}</p>
        </div>
      </div>
    </footer>
  );
};