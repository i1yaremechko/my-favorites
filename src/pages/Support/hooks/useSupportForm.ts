import { useState } from 'react';

import { supabaseService } from '@/services/supabaseClient';

import type { SubmitStatus } from '../types';

interface UseSupportFormParams {
  currentUser: { id: string; email?: string } | null;
}

export const useSupportForm = ({ currentUser }: UseSupportFormParams) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('submitting');
    try {
      await supabaseService.submitFeedback({
        userId: currentUser?.id ?? null,
        name,
        email,
        message,
      });
      setStatus('success');
      setMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setStatus('error');
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    message,
    setMessage,
    status,
    handleSubmit,
  };
};
