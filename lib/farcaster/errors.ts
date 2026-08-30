export class FarcasterApiError extends Error {
  readonly status: number;
  readonly path: string;

  constructor({ status, path, message }: { status: number; path: string; message: string }) {
    super(message);
    this.name = 'FarcasterApiError';
    this.status = status;
    this.path = path;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isRateLimited() {
    return this.status === 429;
  }
}

export function messageFromApiErrorBody(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'errors' in body) {
    const errors = (body as { errors?: Array<{ message?: string }> }).errors;
    const first = errors?.[0]?.message;
    if (first) return first;
  }
  return fallback;
}
