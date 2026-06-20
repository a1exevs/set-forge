export type CommonResponseEnvelope<T> = {
  data: T | null;
  messages: string[];
  fieldsErrors: string[];
  resultCode: number;
};
