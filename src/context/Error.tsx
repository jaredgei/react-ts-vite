import { createContext, Dispatch, ReactNode, SetStateAction, useState } from 'react';

export interface ErrorContextInterface {
  error: Error | null,
  setError: Dispatch<SetStateAction<Error | null>>
};

const ErrorContext = createContext<ErrorContextInterface>({
  error: null,
  setError: (_: Error) => {},
} as ErrorContextInterface);

const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<Error | null>(null);

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export { ErrorContext, ErrorProvider };
