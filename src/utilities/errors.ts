import { ApiError } from '@/utilities/api';

export const toDisplayMessage = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value instanceof ApiError || (import.meta.env.DEV && value instanceof Error)) return value.message;
  return 'An unexpected error occurred. Please try again.';
};
