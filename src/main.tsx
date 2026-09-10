import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { ErrorProvider } from 'context/Error';

import App from 'App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorProvider>
      <App />
    </ErrorProvider>
  </StrictMode>,
);
