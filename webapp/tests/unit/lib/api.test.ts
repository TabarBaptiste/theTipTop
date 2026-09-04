// ===========================================
// Tests unitaires - Client API (intercepteurs axios)
// ===========================================
// Ce module porte deux mecanismes invisibles a l'oeil : l'ajout automatique
// du jeton dans chaque requete, et le rafraichissement silencieux d'une
// session expiree. Une regression ici ne casse rien a l'ecran immediatement,
// mais deconnecte les utilisateurs en silence ou fuit une session qui aurait
// du expirer.

import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

import { api } from '@/lib/api';

interface StoredHandler<V> {
  fulfilled?: (value: V) => V | Promise<V>;
  rejected?: (error: unknown) => unknown;
}

function requestHandler() {
  return (api.interceptors.request as unknown as { handlers: Array<StoredHandler<InternalAxiosRequestConfig>> })
    .handlers[0];
}

function responseHandler() {
  return (api.interceptors.response as unknown as { handlers: Array<StoredHandler<AxiosResponse>> }).handlers[0];
}

function definirAuthStorage(accessToken: string | null) {
  localStorage.setItem('auth-storage', JSON.stringify({ state: { accessToken }, version: 0 }));
}

/** window.location.href n'est pas assignable dans jsdom sans ce remplacement. */
function espionnerNavigation() {
  const cible = { href: '' };
  Object.defineProperty(window, 'location', { value: cible, writable: true });
  return cible;
}

describe('client API', () => {
  const adaptateurInitial = api.defaults.adapter;

  beforeEach(() => {
    localStorage.clear();
    Cookies.remove('refreshToken');
    jest.restoreAllMocks();
  });

  afterEach(() => {
    api.defaults.adapter = adaptateurInitial;
  });

  describe('intercepteur de requete', () => {
    it("n'ajoute pas d'en-tete Authorization sans session stockee", async () => {
      const config = { headers: {} } as InternalAxiosRequestConfig;

      const resultat = await requestHandler().fulfilled!(config);

      expect(resultat.headers.Authorization).toBeUndefined();
    });

    it("n'ajoute pas d'en-tete Authorization quand la session stockee n'a pas de jeton", async () => {
      definirAuthStorage(null);
      const config = { headers: {} } as InternalAxiosRequestConfig;

      const resultat = await requestHandler().fulfilled!(config);

      expect(resultat.headers.Authorization).toBeUndefined();
    });

    it('ajoute le jeton de la session stockee en en-tete Authorization', async () => {
      definirAuthStorage('mon-jeton');
      const config = { headers: {} } as InternalAxiosRequestConfig;

      const resultat = await requestHandler().fulfilled!(config);

      expect(resultat.headers.Authorization).toBe('Bearer mon-jeton');
    });
  });

  describe('intercepteur de reponse - cas de succes', () => {
    it('laisse passer la reponse inchangee', () => {
      const reponse = { status: 200 } as AxiosResponse;

      expect(responseHandler().fulfilled!(reponse)).toBe(reponse);
    });
  });

  describe('intercepteur de reponse - erreurs qui ne declenchent pas de rafraichissement', () => {
    // Ces routes renvoient un 401/403 metier (mauvais identifiants) : y
    // tenter un rafraichissement redirigerait un simple echec de connexion
    // vers /auth/login.
    it("ne tente pas de rafraichissement sur les routes d'authentification", async () => {
      const espionRefresh = jest.spyOn(axios, 'post');
      const config = { url: '/auth/login', headers: {} } as InternalAxiosRequestConfig;
      const erreur = { config, response: { status: 401 } };

      await expect(responseHandler().rejected!(erreur)).rejects.toBe(erreur);
      expect(espionRefresh).not.toHaveBeenCalled();
    });

    it('ne retente pas une requete deja rejouee', async () => {
      const espionRefresh = jest.spyOn(axios, 'post');
      const config = {
        url: '/dashboard/profile',
        headers: {},
        _retry: true,
      } as InternalAxiosRequestConfig & { _retry: boolean };
      const erreur = { config, response: { status: 401 } };

      await expect(responseHandler().rejected!(erreur)).rejects.toBe(erreur);
      expect(espionRefresh).not.toHaveBeenCalled();
    });

    // Un 403 de role (ex : ADMIN tente une route EMPLOYEE-only) n'a rien a
    // voir avec un jeton invalide : ce message precis distingue les deux cas
    // cote API (JwtAuthGuard.handleRequest).
    it("ignore un 403 de role, distinct d'un jeton invalide", async () => {
      const espionRefresh = jest.spyOn(axios, 'post');
      const config = { url: '/admin/users', headers: {} } as InternalAxiosRequestConfig;
      const erreur = {
        config,
        response: { status: 403, data: { message: 'Accès réservé aux administrateurs' } },
      };

      await expect(responseHandler().rejected!(erreur)).rejects.toBe(erreur);
      expect(espionRefresh).not.toHaveBeenCalled();
    });
  });

  describe('intercepteur de reponse - rafraichissement du jeton', () => {
    // Sans cookie de rafraichissement, inutile d'appeler l'API : la session
    // est deja perdue, autant deconnecter tout de suite.
    it('deconnecte immediatement quand le cookie de rafraichissement est absent', async () => {
      const espionRefresh = jest.spyOn(axios, 'post');
      const navigation = espionnerNavigation();
      definirAuthStorage('ancien-jeton');
      const config = { url: '/dashboard/profile', headers: {} } as InternalAxiosRequestConfig;
      const erreur = { config, response: { status: 401 } };

      await expect(responseHandler().rejected!(erreur)).rejects.toBe(erreur);

      expect(espionRefresh).not.toHaveBeenCalled();
      expect(localStorage.getItem('auth-storage')).toBeNull();
      expect(navigation.href).toBe('/auth/login');
    });

    it("deconnecte quand l'appel de rafraichissement echoue", async () => {
      jest.spyOn(axios, 'post').mockRejectedValue(new Error('refresh KO'));
      const navigation = espionnerNavigation();
      Cookies.set('refreshToken', 'rt-perime');
      definirAuthStorage('ancien-jeton');
      const config = { url: '/dashboard/profile', headers: {} } as InternalAxiosRequestConfig;
      const erreur = { config, response: { status: 403, data: { message: 'token absent ou invalide' } } };

      await expect(responseHandler().rejected!(erreur)).rejects.toBe(erreur);

      expect(localStorage.getItem('auth-storage')).toBeNull();
      expect(Cookies.get('refreshToken')).toBeUndefined();
      expect(navigation.href).toBe('/auth/login');
    });

    it('rafraichit la session et rejoue la requete originale apres un succes', async () => {
      jest.spyOn(axios, 'post').mockResolvedValue({
        data: { accessToken: 'nouveau-jeton', refreshToken: 'nouveau-refresh' },
      });
      // Remplace le transport reseau : seule la logique de l'intercepteur est
      // sous test, pas un aller-retour HTTP reel.
      api.defaults.adapter = jest.fn().mockResolvedValue({
        data: { ok: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });
      Cookies.set('refreshToken', 'rt-valide');
      definirAuthStorage('ancien-jeton');
      const config = { url: '/dashboard/profile', headers: {} } as InternalAxiosRequestConfig;
      const erreur = { config, response: { status: 401 } };

      const reponse = await responseHandler().rejected!(erreur);

      expect((reponse as AxiosResponse).data).toEqual({ ok: true });
      expect(config.headers.Authorization).toBe('Bearer nouveau-jeton');
      expect(JSON.parse(localStorage.getItem('auth-storage')!).state.accessToken).toBe(
        'nouveau-jeton',
      );
      expect(Cookies.get('refreshToken')).toBe('nouveau-refresh');
    });
  });
});
