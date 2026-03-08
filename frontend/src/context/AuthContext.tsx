import { createContext, useState, type ReactNode } from "react";

// Defines the shape of auth state/actions exposed to consuming components.
type AuthContextType = {
  // Current JWT token (null means user is logged out).
  token: string | null;
  // Saves token to memory + localStorage.
  login: (jwt: string) => void;
  // Clears token from memory + localStorage.
  logout: () => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null);

// Top-level provider that keeps authentication state synchronized
// between React state and browser persistence (localStorage).
export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage so page refresh keeps user logged in.
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  // Called after successful login/registration.
  const login = (jwt: string) => {
    localStorage.setItem("token", jwt);
    setToken(jwt);
  };

  // Called when user clicks logout or session is invalidated.
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

