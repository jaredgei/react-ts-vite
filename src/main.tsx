import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from 'App.tsx';
import { ErrorProvider } from 'context/Error';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorProvider>
      <App />
    </ErrorProvider>
  </StrictMode>,
);
