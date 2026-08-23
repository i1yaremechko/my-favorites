import { useEffect, useState } from 'react';

import { useLanguage } from '@/hooks/useLanguage';
import { supabaseService } from '@/services/supabaseClient';
import type { Comment } from '@/types/comment';
import type { MediaType } from '@/types/movie';

import styles from './Comments.module.scss';

interface CommentsCurrentUser {
  id: string;
  displayName?: string;
  avatarUrl?: string | null;
}

interface CommentsProps {
  movieId: number;
  mediaType: MediaType;
  currentUser: CommentsCurrentUser | null;
  onRequestLogin?: () => void;
}

const MAX_COMMENT_LENGTH = 500;

export const Comments: React.FC<CommentsProps> = ({
  movieId,
  mediaType,
  currentUser,
  onRequestLogin,
}) => {
  const { language, t } = useLanguage();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    supabaseService
      .getComments(movieId, mediaType)
      .then((data) => {
        if (isMounted) setComments(data);
      })
      .catch((err) => console.error('Could not load comments:', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [movieId, mediaType]);

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(language === 'uk' ? 'uk-UA' : 'en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      onRequestLogin?.();
      return;
    }

    const text = draft.trim();
    if (!text) return;

    setIsSubmitting(true);
    try {
      const newComment = await supabaseService.addComment({
        userId: currentUser.id,
        movieId,
        mediaType,
        authorName: currentUser.displayName || 'User',
        authorAvatarUrl: currentUser.avatarUrl ?? null,
        text,
      });
      setComments((prev) => [newComment, ...prev]);
      setDraft('');
    } catch (err) {
      console.error('Could not add comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!currentUser) return;

    try {
      await supabaseService.deleteComment(commentId, currentUser.id);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('Could not delete comment:', err);
    }
  };

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
                <span className={styles.date}>{formatDate(comment.createdAt)}</span>
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
