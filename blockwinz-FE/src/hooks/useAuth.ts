import { create } from 'zustand';
import { TOKEN_NAME } from '../shared/constants/app.constant';

/**
 * Auth tokens are stored in localStorage for SPA simplicity. XSS on this origin
 * can steal sessions; prefer httpOnly cookies + refresh flow when feasible.
 * See repo root SECURITY.md.
 */
interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
}

const useAuth = create<AuthState>((set) => {
  const initialToken = localStorage.getItem(TOKEN_NAME);

  return {
    token: initialToken,
    isAuthenticated: !!initialToken,
    setToken: (token: string | null) => {
      if (token) {
        localStorage.setItem(TOKEN_NAME, token);
      } else {
        localStorage.removeItem(TOKEN_NAME);
      }
      set({ token, isAuthenticated: !!token });
    },
  };
});

export default useAuth;
