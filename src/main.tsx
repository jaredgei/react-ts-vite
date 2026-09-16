import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from 'App';

import { ErrorProvider } from 'context/Error';

import ErrorBoundary from 'components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ErrorProvider>
        <App />
      </ErrorProvider>
    </ErrorBoundary>
  </StrictMode>,
);
