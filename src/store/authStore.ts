import { create } from 'zustand';
import {
  clearSession,
  getStoredUser,
  connectGithub,
  disconnectGithub,
  getGithubLogin,
  credentialLogin,
  type StudioUser,
} from '../services/authService';
import { loadConfig, saveConfig, type StudioConfig } from '../services/config';

interface AuthState {
  user: StudioUser | null;
  config: StudioConfig;
  /** GitHub account login the saved token belongs to (null if none). */
  githubLogin: string | null;
  loading: boolean;
  error: string | null;

  loginCredential: (username: string, password: string) => Promise<void>;
  /** Save & verify a GitHub token (from Settings). */
  connectGithub: (token: string) => Promise<void>;
  /** Remove the saved GitHub token. */
  disconnectGithub: () => void;
  logout: () => void;
  updateConfig: (patch: Partial<StudioConfig>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getStoredUser(),
  config: loadConfig(),
  githubLogin: getGithubLogin(),
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

  connectGithub: async (token) => {
    const login = await connectGithub(token);
    set({ githubLogin: login });
  },

  disconnectGithub: () => {
    disconnectGithub();
    set({ githubLogin: null });
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
