import { Dispatch, ReactNode, SetStateAction, useState } from 'react';
import { createSafeContext } from 'utilities/context';

export type ErrorContextType = {
  error: Error | null;
  setError: Dispatch<SetStateAction<Error | null>>;
};

const [ErrorContext, useError] = createSafeContext<ErrorContextType>('Error');

const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<Error | null>(null);

  return <ErrorContext value={{ error, setError }}>{children}</ErrorContext>;
};

export { ErrorProvider, useError };
