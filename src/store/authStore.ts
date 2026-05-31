import { create } from 'zustand';
import {
  clearSession,
  getStoredUser,
  githubLogin,
  credentialLogin,
  type StudioUser,
} from '../services/authService';
import { loadConfig, saveConfig, type StudioConfig } from '../services/config';

interface AuthState {
  user: StudioUser | null;
  config: StudioConfig;
  loading: boolean;
  error: string | null;

  loginCredential: (username: string, password: string) => Promise<void>;
  loginGithub: (token: string) => Promise<void>;
  logout: () => void;
  updateConfig: (patch: Partial<StudioConfig>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getStoredUser(),
  config: loadConfig(),
  loading: false,
  error: null,

  loginCredential: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const user = credentialLogin(username, password);
      set({ user, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  loginGithub: async (token) => {
    set({ loading: true, error: null });
    try {
      const user = await githubLogin(token);
      set({ user, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  logout: () => {
    clearSession();
    set({ user: null });
  },

  updateConfig: (patch) => {
    const next = { ...get().config, ...patch };
    saveConfig(next);
    set({ config: next });
  },
}));
