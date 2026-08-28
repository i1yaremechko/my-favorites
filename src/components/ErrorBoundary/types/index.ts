export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackLabel: string;
}

export interface ErrorBoundaryState {
  error: Error | null;
}
