import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../utils/api';

interface KeyAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  keyData: any | null;
  error: string | null;
}

interface KeyAuthContextType extends KeyAuthState {
  verifyKey: (keyFileContent: any) => Promise<boolean>;
  logout: () => void;
  checkExistingSession: () => boolean;
}

const KeyAuthContext = createContext<KeyAuthContextType | null>(null);

export function KeyAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<KeyAuthState>({
    isAuthenticated: false,
    isLoading: false,
    keyData: null,
    error: null,
  });

  const verifyKey = useCallback(async (keyFileContent: any) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.post('/api/verify-key', { keyFile: keyFileContent });

      const data = response.data || response;
      
      if (data.valid) {
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
          error: data.error || response.error || '密钥验证失败',
        }));
        return false;
      }
    } catch (error: any) {
      console.error('验证过程出错:', error);
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

  useEffect(() => {
    checkExistingSession();
  }, [checkExistingSession]);

  return (
    <KeyAuthContext.Provider
      value={{
        ...state,
        verifyKey,
        logout,
        checkExistingSession,
      }}
    >
      {children}
    </KeyAuthContext.Provider>
  );
}

export function useKeyAuth() {
  const context = useContext(KeyAuthContext);
  if (!context) {
    throw new Error('useKeyAuth must be used within a KeyAuthProvider');
  }
  return context;
}
