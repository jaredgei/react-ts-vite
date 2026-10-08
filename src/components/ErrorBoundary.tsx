import styles from '@/styles/ErrorBoundary.module.css';

import { Component, type ErrorInfo, type ReactNode } from 'react';

import Button from '@/components/Button';

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className={styles.errorBoundary}>
        <div className={styles.title}>Something went wrong</div>
        <div className={styles.message}>{this.state.error.message}</div>
        <Button text='Reload' onClick={() => window.location.reload()} className={styles.action} />
      </div>
    );
  }
}

export default ErrorBoundary;
