import { useState, useCallback } from 'react';
import api, { ApiResponse, ApiError } from '../utils/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T = any>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (
    endpoint: string,
    options?: { method?: string; body?: any }
  ) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      let response: ApiResponse<T>;

      if (options?.method === 'POST' || options?.body) {
        response = await api.post(endpoint, options.body);
      } else {
        response = await api.get<T>(endpoint);
      }

      setState({
        data: response.data || response as T,
        loading: false,
        error: null,
      });

      return response;
    } catch (error: any) {
      const errorMessage = error.message || '请求失败';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
