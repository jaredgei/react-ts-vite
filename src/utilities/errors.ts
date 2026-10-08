export const toError = (value: unknown): Error => {
  if (value instanceof Error) return value;
  if (typeof value === 'string') return new Error(value);
  return new Error('An unexpected error occurred.');
};
