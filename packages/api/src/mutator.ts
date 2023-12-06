import { getBaseUrl } from 'web/service/getBaseUrl';

type CustomClient = {
  url: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  params?: Record<string, any>;
  headers?: HeadersInit;
  data?: BodyType<unknown>;
  signal?: AbortSignal;
};

const customClient = async <ResponseType>(
  { url, method, params, headers, signal, data }: CustomClient,
  options?: RequestInit,
): Promise<ResponseType> => {
  const searchParams = params ? `?${new URLSearchParams(params)}` : '';
  const response = await fetch(getBaseUrl() + url + searchParams, {
    headers: {
      ...headers,
    },
    method,
    signal,
    ...(data ? { body: JSON.stringify(data) } : {}),
    ...options,
  });

  if (response.ok) {
    return await response.json();
  } else {
    const parsedJSON = await response.json();

    throw new Error(`[NetworkError] ${JSON.stringify(parsedJSON)}`, {
      cause: { status: response.status, ...parsedJSON },
    });
  }
};

export { customClient };

export type ErrorType<ErrorData> = {
  cause: {
    status: number;
  } & ErrorData;
};
export type BodyType<BodyData> = BodyData;
