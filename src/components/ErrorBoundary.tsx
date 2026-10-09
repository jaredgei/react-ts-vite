import styles from '@/styles/StatusPage.module.css';

import { Component, type ErrorInfo, type ReactNode } from 'react';

import Button from '@/components/Button';

import { toDisplayMessage } from '@/utilities/errors';

type Props = {
  children: ReactNode;
};

type State = {
  error: unknown;
  hasError: boolean;
};

class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { error, hasError: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className={styles.statusPage}>
        <h1 className={styles.title}>Something went wrong</h1>
        <p className={styles.message}>{toDisplayMessage(this.state.error)}</p>
        <Button onClick={() => window.location.reload()} className={styles.action}>
          Reload
        </Button>
      </main>
    );
  }
}

export default ErrorBoundary;
