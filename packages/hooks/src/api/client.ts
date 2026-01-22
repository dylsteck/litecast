export interface ApiConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}

let apiConfig: ApiConfig = {
  baseUrl: '',
};

export function configureApi(config: ApiConfig): void {
  apiConfig = { ...apiConfig, ...config };
}

export function getApiConfig(): ApiConfig {
  return apiConfig;
}

export async function apiRequest<T>(
  endpoint: string,
  params?: Record<string, unknown>,
  options?: RequestInit
): Promise<T> {
  const { baseUrl, headers: defaultHeaders } = apiConfig;

  if (!baseUrl) {
    throw new Error('API base URL not configured. Call configureApi() first.');
  }

  const url = new URL(`${baseUrl}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...defaultHeaders,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(`API error: ${response.status}`) as Error & { status: number; data: unknown };
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  return response.json();
}

export async function apiPost<T>(
  endpoint: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  const { baseUrl, headers: defaultHeaders } = apiConfig;

  if (!baseUrl) {
    throw new Error('API base URL not configured. Call configureApi() first.');
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...defaultHeaders,
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(`API error: ${response.status}`) as Error & { status: number; data: unknown };
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  return response.json();
}
