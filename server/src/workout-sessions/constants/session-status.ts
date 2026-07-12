export const SESSION_STATUSES = ['active', 'completed'] as const;

export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const SESSION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const;
