import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { User } from '../types/index.js';
import { fetchJson } from '../utils/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  authConfigLoading: boolean;
  authConfigError: string | null;
  error: string | null;
  googleClientId: string;
  supabaseEnabled: boolean;
  loginWithGoogleCredential: (credential: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  retryAuthConfiguration: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_KEY = 'koko_market_token_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);
  const [authConfigLoading, setAuthConfigLoading] = useState(true);
  const [authConfigError, setAuthConfigError] = useState<string | null>(null);
  const [authConfigAttempt, setAuthConfigAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [googleClientId, setGoogleClientId] = useState('');
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  const syncSupabaseSession = useCallback(async (session: Session | null) => {
    if (!session?.access_token) {
      if (!localStorage.getItem(TOKEN_KEY)) {
        setUser(null);
        setIsLoading(false);
      }
      return;
    }

    try {
      const data = await fetchJson<{ token: string; user: User }>('/api/auth/supabase', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      setError(null);
      if (window.location.hash !== '#account') {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#account`);
      }
    } catch (reason: any) {
      setError(reason.message || 'Could not complete Google sign-in');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    const configureSupabaseAuth = async () => {
      setAuthConfigLoading(true);
      setAuthConfigError(null);
      try {
        const data = await fetchJson<{ googleClientId?: string; supabaseUrl?: string; supabaseAnonKey?: string }>('/api/config');
        if (!data.supabaseUrl || !data.supabaseAnonKey) {
          throw new Error('The sign-in configuration is unavailable.');
        }

        const client = createClient(data.supabaseUrl, data.supabaseAnonKey);
        if (!active) return;

        setSupabase(client);
        setGoogleClientId(data.googleClientId || '');
        const listener = client.auth.onAuthStateChange((_event, session) => {
          if (session) void syncSupabaseSession(session);
        });
        unsubscribe = () => listener.data.subscription.unsubscribe();

        const { data: sessionData } = await client.auth.getSession();
        if (sessionData.session) void syncSupabaseSession(sessionData.session);
      } catch (reason) {
        if (!active) return;
        setSupabase(null);
        setAuthConfigError('We could not prepare secure Google sign-in. Please try again.');
      } finally {
        if (active) setAuthConfigLoading(false);
      }
    };

    void configureSupabaseAuth();
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [authConfigAttempt, syncSupabaseSession]);

  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem(TOKEN_KEY);
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await fetchJson<{ authenticated?: boolean; user?: User }>('/api/auth/me', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      }
    } catch (reason) {
      console.warn('Error verifying auth session:', reason);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const loginWithGoogleCredential = useCallback(async (credential: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchJson<{ token: string; user: User }>('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return true;
    } catch (reason: any) {
      setError(reason.message || 'Google sign-in could not be completed.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    if (!supabase) {
      setError('Secure Google sign-in is still preparing. Please try again.');
      return;
    }

    setError(null);
    setIsLoading(true);
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (supabase) await supabase.auth.signOut();
      const currentToken = token || localStorage.getItem(TOKEN_KEY);
      if (currentToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${currentToken}` },
        });
      }
    } catch (reason) {
      console.warn('Logout request failed:', reason);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  const retryAuthConfiguration = useCallback(() => {
    setAuthConfigAttempt((attempt) => attempt + 1);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      authConfigLoading,
      authConfigError,
      error,
      googleClientId,
      supabaseEnabled: Boolean(supabase),
      loginWithGoogleCredential,
      signInWithGoogle,
      logout,
      clearError: () => setError(null),
      refreshUser,
      retryAuthConfiguration,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
