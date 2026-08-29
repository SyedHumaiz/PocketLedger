import type { AxiosError } from 'axios';

export interface ApiError { status:number|null; message:string; }
type ErrorResponse = { message?: string | string[] };

function messageFrom(value: unknown): string | null {
  if (typeof value === 'string' && Boolean(value.trim())) return value;
  if (Array.isArray(value)) {
    const messages = value.filter((message): message is string => typeof message === 'string' && Boolean(message.trim()));
    if (messages.length) return messages.join('\n');
  }
  return null;
}

export function toApiError(error: unknown): ApiError {
  if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
    const known = error as Partial<ApiError>;
    return { status: typeof known.status === 'number' ? known.status : null, message: messageFrom(known.message) ?? 'Network request failed.' };
  }
  const axiosError = error as AxiosError<ErrorResponse>;
  return {
    status: axiosError.response?.status ?? null,
    message: messageFrom(axiosError.response?.data?.message) ?? axiosError.message ?? 'Network request failed.',
  };
}
