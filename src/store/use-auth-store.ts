import { storage } from 'utils/storage';
import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setAccessToken: (accessToken: string) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(set => ({
  accessToken: null,
  isAuthenticated: false,

  setTokens: async (accessToken, refreshToken) => {
    await storage.setItem('willfit:rfk_v1_z9x_auth', refreshToken);
    set({ accessToken, isAuthenticated: true });
  },

  setAccessToken: accessToken => {
    set({ accessToken });
  },

  logout: async () => {
    await storage.removeItem('willfit:rfk_v1_z9x_auth');
    set({ accessToken: null, isAuthenticated: false });
  },
}));
