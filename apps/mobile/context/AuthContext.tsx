import { createContext, useContext, useState, ReactNode } from 'react';

export type AuthState = {
  playerId: string;
  idToken: string;
};

type AuthContextValue = {
  auth: AuthState | null;
  signIn: (state: AuthState) => void;
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(null);

  const signIn = (state: AuthState) => setAuth(state);
  const signOut = () => setAuth(null);

  return (
    <AuthContext.Provider value={{ auth, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
