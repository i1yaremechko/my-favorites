import { useLanguage } from '@/hooks/useLanguage';
import { useComments } from './hooks/useComments';
import { formatCommentDate } from './utils';
import { MAX_COMMENT_LENGTH, type CommentsProps } from './types';

import styles from './index.module.scss';

export const Comments: React.FC<CommentsProps> = ({
  movieId,
  mediaType,
  currentUser,
  onRequestLogin,
}) => {
  const { language, t } = useLanguage();

  const {
    comments,
    isLoading,
    draft,
    setDraft,
    isSubmitting,
    handleSubmit,
    handleDelete,
  } = useComments({ movieId, mediaType, currentUser, onRequestLogin });

  return (
    <div className={styles.comments}>
      <h4 className={styles.title}>
        {t('commentsTitle')} {comments.length > 0 && `(${comments.length})`}
      </h4>

      <form className={styles.form} onSubmit={handleSubmit}>
        <textarea
          className={styles.textarea}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={currentUser ? t('commentsPlaceholder') : t('commentsLoginPrompt')}
          maxLength={MAX_COMMENT_LENGTH}
          rows={2}
          onFocus={() => {
            if (!currentUser) onRequestLogin?.();
          }}
        />

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting || !draft.trim()}
        >
          {t('commentsSubmit')}
        </button>
      </form>

      {!isLoading && comments.length === 0 && (
        <p className={styles.empty}>{t('commentsEmpty')}</p>
      )}

      <ul className={styles.list}>
        {comments.map((comment) => (
          <li key={comment.id} className={styles.item}>
            {comment.authorAvatarUrl ? (
              <img src={comment.authorAvatarUrl} alt="" className={styles.avatar} />
            ) : (
              <div className={styles.avatarFallback}>{comment.authorName.charAt(0)}</div>
            )}

            <div className={styles.body}>
              <div className={styles.meta}>
                <span className={styles.author}>{comment.authorName}</span>
                <span className={styles.date}>{formatCommentDate(comment.createdAt, language)}</span>
              </div>
              <p className={styles.text}>{comment.text}</p>
            </div>

            {currentUser?.id === comment.userId && (
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => handleDelete(comment.id)}
                aria-label={t('commentsDelete')}
              >
                &times;
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};