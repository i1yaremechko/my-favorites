import React from 'react';

import type { ErrorBoundaryProps, ErrorBoundaryState } from './types';

import styles from './index.module.scss';

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
        <p className={styles.errorBoundaryMessage}>
          {this.props.fallbackLabel}: {this.state.error.message}
        </p>
      );
    }

    return this.props.children;
  }
}