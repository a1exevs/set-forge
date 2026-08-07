import { User } from '@users/users.model';

export const mockUsers = (count: number): Partial<User>[] => {
  if (count <= 0) {
    return [];
  }
  const response: Partial<User>[] = [];
  for (let i = 0; i < count; ++i) {
    const j = i + 1;
    response.push({ id: j, email: `email${j}`, password: `password${j}`, roles: [] });
  }
  return response;
};
