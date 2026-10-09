import { type ReactNode, useCallback, useMemo, useState } from 'react';

import { ErrorContext } from '@/context/Error';

import { toDisplayMessage } from '@/utilities/errors';

const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [message, setMessage] = useState<string | null>(null);

  const showError = useCallback((value: unknown) => setMessage(toDisplayMessage(value)), []);
  const clearError = useCallback(() => setMessage(null), []);

  const value = useMemo(() => ({ message, showError, clearError }), [message, showError, clearError]);

  return <ErrorContext value={value}>{children}</ErrorContext>;
};

export default ErrorProvider;
