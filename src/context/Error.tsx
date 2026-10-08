import { type ReactNode, useCallback, useMemo, useState } from 'react';

import { createSafeContext } from '@/utilities/context';
import { toError } from '@/utilities/errors';

export type ErrorContextType = {
  error: Error | null;
  showError: (value: unknown) => void;
  clearError: () => void;
};

const [ErrorContext, useError] = createSafeContext<ErrorContextType>('Error');

const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<Error | null>(null);

  const showError = useCallback((value: unknown) => setError(toError(value)), []);
  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(() => ({ error, showError, clearError }), [error, showError, clearError]);

  return <ErrorContext value={value}>{children}</ErrorContext>;
};

export { ErrorProvider, useError };
