import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CLIENT' | 'EMPLOYEE' | 'ADMIN';
  phone?: string;
  birthDate?: string;
  gender?: string;
  consentEmail?: boolean;
  consentData?: boolean;
  createdAt: string;
  /**
   * Faux pour un compte créé par Google ou Facebook, qui n'a jamais eu de mot
   * de passe. Sa page de paramètres propose alors d'en définir un plutôt que
   * d'en changer. Le hachage lui-même ne quitte jamais l'API.
   */
  hasPassword?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  login: (email: string, password: string) => Promise<void>;
  handleOAuthCallback: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken });
        Cookies.set('refreshToken', refreshToken, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
      },

      login: async (email, password) => {
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, accessToken, refreshToken } = response.data;
          
          get().setTokens(accessToken, refreshToken);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // L'inscription ne figure plus ici : elle n'ouvre pas de session. Le compte
      // n'existe qu'une fois confirme le code recu par email, et c'est cette
      // confirmation qui appelle setTokens, depuis la page d'inscription.

      handleOAuthCallback: async (accessToken, refreshToken) => {
        // Stocke les tokens reçus du back-end après le flux OAuth,
        // puis récupère le profil pour hydrater le store.
        get().setTokens(accessToken, refreshToken);
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch (error) {
          get().logout();
          throw error;
        }
      },

      logout: () => {
        Cookies.remove('refreshToken');
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      refreshToken: async () => {
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) {
          get().logout();
          return;
        }

        try {
          const response = await api.post('/auth/refresh', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          get().setTokens(accessToken, newRefreshToken);
        } catch (error) {
          get().logout();
          throw error;
        }
      },

      checkAuth: async () => {
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) {
          get().logout();
          return;
        }

        try {
          await get().refreshToken();
          const response = await api.get('/auth/me');
          set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
