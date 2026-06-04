import { createContext, use } from 'react';

export const createSafeContext = <T>(name: string) => {
  const Context = createContext<T | null>(null);

  const useSafeContext = () => {
    const context = use(Context);
    if (!context) throw new Error(`use${name} must be used within an ${name}Provider`);
    return context;
  };

  return [Context, useSafeContext] as const;
};
