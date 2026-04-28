import { GetUsersResponse } from '@users/dto';
import { User } from '@users/users.model';

export const mockUsers = (count: number): Partial<User>[] => {
  if (count <= 0) return [];
  const response: Partial<User>[] = [];
  for (let i = 0; i < count; ++i) {
    const j = i + 1;
    response.push({ id: j, email: `email${j}`, password: `password${j}`, status: `status${j}`, roles: [] });
  }
  return response;
};

export const mockGetUsersResponse = (): GetUsersResponse.Data => {
  const user1: GetUsersResponse.User = { id: 1, email: 'email1', status: 'status1', followed: false, avatar: null };
  const user2: GetUsersResponse.User = { id: 2, email: 'email2', status: 'status2', followed: true, avatar: null };
  const user3: GetUsersResponse.User = { id: 3, email: 'email3', status: 'status3', followed: true, avatar: null };
  const items = [user1, user2, user3];
  return { totalCount: items.length, items };
};
