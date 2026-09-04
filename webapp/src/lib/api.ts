import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pour ajouter le token
api.interceptors.request.use((config) => {
  // Récupérer le token depuis le store Zustand (si côté client)
  if (typeof window !== 'undefined') {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const { state } = JSON.parse(authStorage);
      if (state?.accessToken) {
        config.headers.Authorization = `Bearer ${state.accessToken}`;
      }
    }
  }
  return config;
});

// Routes d'authentification : un 401/403 y est une réponse métier
// (mauvais identifiants, etc.), surtout PAS une session expirée.
// On ne doit donc ni tenter de refresh, ni rediriger.
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh'];

// Interceptor pour gérer le refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl: string = originalRequest?.url || '';
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => requestUrl.includes(path));

    // Le back-end envoie 403 (et non 401) quand le token est absent ou invalide
    // (cf. JwtAuthGuard.handleRequest - specs projet).
    // On détecte ce cas précis via le message pour ne pas confondre avec un
    // vrai 403 de rôle (ex : ADMIN tentant une route EMPLOYEE-only).
    const isTokenError =
      error.response?.status === 401 ||
      (error.response?.status === 403 &&
        error.response?.data?.message?.includes('token absent ou invalide'));

    // Si token invalide/expiré, pas déjà un retry, et hors routes d'auth
    if (isTokenError && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Mettre à jour le storage
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          parsed.state.accessToken = accessToken;
          localStorage.setItem('auth-storage', JSON.stringify(parsed));
        }

        // Mettre à jour le cookie
        Cookies.set('refreshToken', newRefreshToken, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });

        // Retenter la requête originale
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        // Déconnexion si le refresh échoue
        localStorage.removeItem('auth-storage');
        Cookies.remove('refreshToken');
        
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        
        throw error;
      }
    }

    throw error;
  }
);

// Types pour les réponses API
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
