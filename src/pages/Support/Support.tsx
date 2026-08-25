import { useState } from 'react';

import { SUPPORT_LINKS } from '@/config/supportLinks';
import { useLanguage } from '@/hooks/useLanguage';
import { supabaseService } from '@/services/supabaseClient';

import styles from './Support.module.scss';

interface SupportProps {
  currentUser: { id: string; email?: string } | null;
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

export const Support: React.FC<SupportProps> = ({ currentUser }) => {
  const { t } = useLanguage();
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

  return (
    <div className={styles.supportPage}>
      <h2 className={styles.title}>{t('supportTitle')}</h2>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('feedbackTitle')}</h3>
        <p className={styles.sectionHint}>{t('feedbackHint')}</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <input
              type="text"
              className={styles.input}
              placeholder={t('feedbackNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              className={styles.input}
              placeholder={t('feedbackEmailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <textarea
            className={styles.textarea}
            placeholder={t('feedbackMessagePlaceholder')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={2000}
            required
          />

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={status === 'submitting' || !message.trim()}
          >
            {status === 'submitting' ? t('feedbackSending') : t('feedbackSubmit')}
          </button>

          {status === 'success' && <p className={styles.successMsg}>{t('feedbackSuccess')}</p>}
          {status === 'error' && <p className={styles.errorMsg}>{t('feedbackError')}</p>}
        </form>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('donateTitle')}</h3>
        <p className={styles.sectionHint}>{t('donateHint')}</p>

        <div className={styles.donateLinks}>
          {SUPPORT_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.donateCard}
            >
              <span className={styles.donateLabel}>{t(link.labelKey)}</span>
              <span className={styles.donateDescription}>{t(link.descriptionKey)}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};
