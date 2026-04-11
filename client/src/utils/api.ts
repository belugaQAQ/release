import { API_BASE_URL, ERROR_MESSAGES } from './constants';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.error || 'UNKNOWN_ERROR',
        data.message || ERROR_MESSAGES.UNKNOWN_ERROR
      );
    }

    return data;

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(0, 'NETWORK_ERROR', ERROR_MESSAGES.NETWORK_ERROR);
  }
}

async function requestText(endpoint: string, options: RequestInit = {}): Promise<string> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, 'HTTP_ERROR', await response.text());
    }

    return response.text();

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(0, 'NETWORK_ERROR', ERROR_MESSAGES.NETWORK_ERROR);
  }
}

export const api = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
};

export async function downloadKeyFile(): Promise<ApiResponse> {
  return api.post('/api/generate-key');
}

export async function verifyKeyFile(keyFile: any): Promise<{ valid: boolean; error?: string; keyId?: string; message?: string }> {
  const response = await api.post('/api/verify-key', { keyFile });
  return response.data || response;
}

export async function resetKey(reason: string): Promise<ApiResponse> {
  const keyFile = localStorage.getItem('keyFile');
  const headers: Record<string, string> = {};
  
  if (keyFile) {
    headers['Authorization'] = `Bearer ${keyFile}`;
  }
  
  return request('/api/reset-key', {
    method: 'POST',
    headers,
    body: JSON.stringify({ reason }),
  });
}

export async function updateLatestData(data: any, keyFile: any): Promise<ApiResponse> {
  let actualKeyFile = keyFile;
  
  if (!actualKeyFile) {
    const stored = sessionStorage.getItem('auth_key');
    if (stored) {
      try {
        actualKeyFile = JSON.parse(stored);
      } catch {
        console.error('Failed to parse stored key file');
      }
    }
  }

  if (!actualKeyFile) {
    throw new Error('No authentication key available');
  }

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${JSON.stringify(actualKeyFile)}`,
  };
  
  return request('/api/update', {
    method: 'POST',
    headers,
    body: JSON.stringify({ data }),
  });
}

export async function getLatestData(): Promise<ApiResponse> {
  return api.get('/api/latest.json');
}

export async function getChangelog(): Promise<string> {
  return requestText('/api/changelog.md');
}

export async function updateChangelog(content: string, keyFile: any): Promise<ApiResponse> {
  let actualKeyFile = keyFile;
  
  if (!actualKeyFile) {
    const stored = sessionStorage.getItem('auth_key');
    if (stored) {
      try {
        actualKeyFile = JSON.parse(stored);
      } catch {
        console.error('Failed to parse stored key file');
      }
    }
  }

  if (!actualKeyFile) {
    throw new Error('No authentication key available');
  }

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${JSON.stringify(actualKeyFile)}`,
  };
  
  return request('/api/changelog.md', {
    method: 'POST',
    headers,
    body: JSON.stringify({ content }),
  });
}

export { ApiError, ApiResponse };
export default api;