import { Nullable } from '@alexevs/ts-guards';

export const formatDate = (date: Nullable<string>): string => {
  if (!date) return 'Never';
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
};
