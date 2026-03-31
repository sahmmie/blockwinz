import { create } from 'zustand';
import axios from 'axios';
import { SERVER_BASE_URL } from '../shared/constants/app.constant';

/**
 * Access JWT is kept in memory only (not localStorage) to reduce XSS impact.
 * Long-lived session uses httpOnly refresh cookie + POST /authentication/refresh.
 * See repo root SECURITY.md.
 */
interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  hasBootstrapped: boolean;
  isBootstrapping: boolean;
  bootstrapSession: () => Promise<void>;
}

const useAuth = create<AuthState>((set, get) => {
  return {
    token: null,
    isAuthenticated: false,
    hasBootstrapped: false,
    isBootstrapping: false,
    setToken: (token: string | null) => {
      set({ token, isAuthenticated: !!token });
    },
    bootstrapSession: async () => {
      if (get().isBootstrapping) return;
      if (get().token) {
        set({ hasBootstrapped: true, isBootstrapping: false });
        return;
      }
      set({ isBootstrapping: true });
      try {
        const { data } = await axios.post<{ token: string }>(
          `${SERVER_BASE_URL}/api/authentication/refresh`,
          {},
          { withCredentials: true },
        );
        if (data?.token) {
          set({
            token: data.token,
            isAuthenticated: true,
            hasBootstrapped: true,
            isBootstrapping: false,
          });
          return;
        }
      } catch {
        set({
          token: null,
          isAuthenticated: false,
          hasBootstrapped: true,
          isBootstrapping: false,
        });
      }
    },
  };
});

export default useAuth;
