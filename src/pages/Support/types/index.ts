export interface SupportProps {
  currentUser: { id: string; email?: string } | null;
}

export type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';
