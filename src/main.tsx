import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from 'App';

import { AuthProvider } from 'context/Auth';
import { ErrorProvider } from 'context/Error';

import ErrorBoundary from 'components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ErrorProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorProvider>
    </ErrorBoundary>
  </StrictMode>,
);
