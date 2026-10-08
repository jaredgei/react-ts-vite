import type { ReactNode } from 'react';

import { AuthProvider } from '@/context/Auth';
import { ErrorProvider } from '@/context/Error';

import ErrorBoundary from '@/components/ErrorBoundary';

const Providers = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary>
    <ErrorProvider>
      <AuthProvider>{children}</AuthProvider>
    </ErrorProvider>
  </ErrorBoundary>
);

export default Providers;
