import { useLanguage } from '@/hooks/useLanguage';
import { getPageNumbers } from './utils';

import styles from './index.module.scss';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const { t } = useLanguage();

  if (totalPages <= 1) return null;

  const pagesList = getPageNumbers(currentPage, totalPages);

  return (
    <div className={styles.pagination}>
      <button
        type="button"
        className={styles.pageBtn}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        {t('paginationBack')}
      </button>

      <div className={styles.pagesList}>
        {pagesList.map((page, index) =>
          typeof page === 'number' ? (
            <button
              key={index}
              type="button"
              className={`${styles.pageNumberBtn} ${currentPage === page ? styles.active : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ) : (
            <span key={index} className={styles.dots}>
              {page}
            </span>
          )
        )}
      </div>

      <button
        type="button"
        className={styles.pageBtn}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        {t('paginationNext')}
      </button>
    </div>
  );
};