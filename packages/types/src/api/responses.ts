export interface ApiSuccessResponse<T> {
  data: T;
  success: true;
}

export interface ApiErrorResponse {
  error: string;
  success: false;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginatedResponse<T> {
  data: T[];
  next: {
    cursor: string | null;
  };
}
