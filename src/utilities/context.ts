import { createContext, use } from 'react';

export const createSafeContext = <T>(name: string) => {
  const Context = createContext<T | undefined>(undefined);

  const useSafeContext = () => {
    const context = use(Context);
    if (context === undefined) throw new Error(`use${name} must be used within an ${name}Provider`);
    return context;
  };

  return [Context, useSafeContext] as const;
};
