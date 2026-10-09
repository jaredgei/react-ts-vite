import { createSafeContext } from '@/utilities/context';

export type ErrorContextType = {
  message: string | null;
  showError: (value: unknown) => void;
  clearError: () => void;
};

export const [ErrorContext, useError] = createSafeContext<ErrorContextType>('Error');
