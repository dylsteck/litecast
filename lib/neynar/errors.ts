// Custom error classes for Neynar API

export class NeynarAPIError extends Error {
  statusCode?: number;
  
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'NeynarAPIError';
    this.statusCode = statusCode;
  }
}

export class NeynarAuthError extends NeynarAPIError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'NeynarAuthError';
  }
}

export class NeynarRateLimitError extends NeynarAPIError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429);
    this.name = 'NeynarRateLimitError';
  }
}

export class NeynarNotFoundError extends NeynarAPIError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NeynarNotFoundError';
  }
}

export function handleNeynarError(error: any): never {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.message;
    
    if (status === 401 || status === 403) {
      throw new NeynarAuthError(message);
    } else if (status === 404) {
      throw new NeynarNotFoundError(message);
    } else if (status === 429) {
      throw new NeynarRateLimitError(message);
    } else {
      throw new NeynarAPIError(message, status);
    }
  }
  
  throw new NeynarAPIError(error.message || 'Unknown error occurred');
}

