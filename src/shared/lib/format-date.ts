export const formatDate = (date: string | null): string => {
  if (!date) return 'Never';
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
};
