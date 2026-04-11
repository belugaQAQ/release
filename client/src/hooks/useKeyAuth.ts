import { useState, useCallback } from 'react';
import api from '../utils/api';

interface KeyAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  keyData: any | null;
  error: string | null;
}

export function useKeyAuth() {
  const [state, setState] = useState<KeyAuthState>({
    isAuthenticated: false,
    isLoading: false,
    keyData: null,
    error: null,
  });

  const verifyKey = useCallback(async (keyFileContent: any) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.post('/verify-key', { keyFile: keyFileContent });

      if (response.valid) {
        setState({
          isAuthenticated: true,
          isLoading: false,
          keyData: keyFileContent,
          error: null,
        });
        
        sessionStorage.setItem('auth_key', JSON.stringify(keyFileContent));
        
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: response.error || '密钥验证失败',
        }));
        return false;
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || '验证过程出错',
      }));
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('auth_key');
    setState({
      isAuthenticated: false,
      isLoading: false,
      keyData: null,
      error: null,
    });
  }, []);

  const checkExistingSession = useCallback(() => {
    const storedKey = sessionStorage.getItem('auth_key');
    if (storedKey) {
      try {
        const keyData = JSON.parse(storedKey);
        setState({
          isAuthenticated: true,
          isLoading: false,
          keyData,
          error: null,
        });
        return true;
      } catch {
        sessionStorage.removeItem('auth_key');
      }
    }
    return false;
  }, []);

  return {
    ...state,
    verifyKey,
    logout,
    checkExistingSession,
  };
}
