import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackLabel: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary] ${this.props.fallbackLabel}:`, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <p style={{ color: '#ff5722', fontSize: '13px', margin: 0 }}>
          {this.props.fallbackLabel}: {this.state.error.message}
        </p>
      );
    }

    return this.props.children;
  }
}
