import type { ApiErrorItem } from './api-error';

export type CommonResponseEnvelope<T> = {
  data: T | null;
  messages: string[];
  fieldsErrors: ApiErrorItem[];
  resultCode: number;
};
