import { useEffect, useState } from 'react';

import { supabaseService } from '@/services/supabaseClient';
import type { MediaType } from '@/types/movie';

import type { Comment, CommentsProps } from '../types';

interface UseCommentsParams {
  movieId: number;
  mediaType: MediaType;
  currentUser: CommentsProps['currentUser'];
  onRequestLogin?: () => void;
}

export const useComments = ({
  movieId,
  mediaType,
  currentUser,
  onRequestLogin,
}: UseCommentsParams) => {
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

  return {
    comments,
    isLoading,
    draft,
    setDraft,
    isSubmitting,
    handleSubmit,
    handleDelete,
  };
};
