import type { ReactNode } from 'react';

import AuthProvider from '@/context/AuthProvider';
import ErrorProvider from '@/context/ErrorProvider';

import ErrorBoundary from '@/components/ErrorBoundary';

const Providers = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary>
    <ErrorProvider>
      <AuthProvider>{children}</AuthProvider>
    </ErrorProvider>
  </ErrorBoundary>
);

export default Providers;
