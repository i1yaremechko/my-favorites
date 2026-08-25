import { useLanguage } from '@/hooks/useLanguage';

import styles from './Footer.module.scss';

interface FooterProps {
  onSupportClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSupportClick }) => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.text}>
            © {currentYear} <span className={styles.brand}>Favorite5</span>. {t('footerDescription')}
          </p>
          <p className={styles.subText}>{t('footerMade')}</p>

          {onSupportClick && (
            <button type="button" className={styles.supportBtn} onClick={onSupportClick}>
              {t('footerSupportLink')}
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
