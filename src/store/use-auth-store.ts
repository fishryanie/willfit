import { create } from 'zustand';
import { storage, StorageKeys } from 'lib/storage';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: !!storage.getString(StorageKeys.REFRESH_TOKEN),
  
  setTokens: (accessToken, refreshToken) => {
    storage.set(StorageKeys.REFRESH_TOKEN, refreshToken);
    set({ accessToken, isAuthenticated: true });
  },

  setAccessToken: (accessToken) => {
    set({ accessToken });
  },

  logout: () => {
    storage.remove(StorageKeys.REFRESH_TOKEN);
    set({ accessToken: null, isAuthenticated: false });
  },
}));
