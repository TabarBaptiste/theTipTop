// ===========================================
// Tests unitaires - Store d'authentification
// ===========================================
// Ce store detient la session : jetons, profil, et le moment ou l'on considere
// quelqu'un comme connecte. Une erreur ici ne se voit pas a l'ecran mais
// laisserait une session ouverte apres deconnexion, ou fermee alors qu'elle est
// valide.

import Cookies from 'js-cookie';

import { useAuthStore } from './auth-store';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: { post: jest.fn(), get: jest.fn() },
}));

const apiSimule = api as jest.Mocked<typeof api>;

const UTILISATEUR = {
  id: 'u1',
  email: 'jean@email.fr',
  firstName: 'Jean',
  lastName: 'Dupont',
  role: 'CLIENT' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
};

function reinitialiser() {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  });
  Cookies.remove('refreshToken');
}

describe('store d’authentification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    reinitialiser();
  });

  describe('connexion', () => {
    it('enregistre le profil et les jetons', async () => {
      apiSimule.post.mockResolvedValue({
        data: { user: UTILISATEUR, accessToken: 'at', refreshToken: 'rt' },
      } as never);

      await useAuthStore.getState().login('jean@email.fr', 'Motdepasse1!');

      const etat = useAuthStore.getState();
      expect(etat.isAuthenticated).toBe(true);
      expect(etat.user).toEqual(UTILISATEUR);
      expect(etat.accessToken).toBe('at');
      // Le jeton de rafraichissement vit dans un cookie, pas dans le store :
      // il doit survivre a un rechargement de page.
      expect(Cookies.get('refreshToken')).toBe('rt');
    });

    // Une erreur reseau ne doit pas laisser l'interface bloquee sur un
    // chargement perpetuel, ni faire croire a une session ouverte.
    it('laisse la session fermee quand les identifiants sont refuses', async () => {
      apiSimule.post.mockRejectedValue(new Error('401'));

      await expect(
        useAuthStore.getState().login('jean@email.fr', 'mauvais'),
      ).rejects.toThrow();

      const etat = useAuthStore.getState();
      expect(etat.isAuthenticated).toBe(false);
      expect(etat.isLoading).toBe(false);
    });
  });

  describe('deconnexion', () => {
    it('efface le profil, le jeton et le cookie', () => {
      Cookies.set('refreshToken', 'rt');
      useAuthStore.setState({ user: UTILISATEUR, accessToken: 'at', isAuthenticated: true });

      useAuthStore.getState().logout();

      const etat = useAuthStore.getState();
      expect(etat.user).toBeNull();
      expect(etat.accessToken).toBeNull();
      expect(etat.isAuthenticated).toBe(false);
      expect(Cookies.get('refreshToken')).toBeUndefined();
    });
  });

  describe('retour du fournisseur tiers', () => {
    it('hydrate le profil a partir des jetons recus', async () => {
      apiSimule.get.mockResolvedValue({ data: UTILISATEUR } as never);

      await useAuthStore.getState().handleOAuthCallback('at', 'rt');

      expect(useAuthStore.getState().user).toEqual(UTILISATEUR);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    // Des jetons refuses par /auth/me signifient une session invalide : la
    // conserver afficherait une interface connectee dont chaque appel echouerait.
    it('ferme la session si le profil est inaccessible', async () => {
      apiSimule.get.mockRejectedValue(new Error('403'));

      await expect(useAuthStore.getState().handleOAuthCallback('at', 'rt')).rejects.toThrow();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(Cookies.get('refreshToken')).toBeUndefined();
    });
  });

  describe('verification au demarrage', () => {
    // Sans cookie, inutile d'interroger l'API : on tranche localement.
    it('ferme la session sans jeton de rafraichissement', async () => {
      await useAuthStore.getState().checkAuth();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(apiSimule.get).not.toHaveBeenCalled();
    });

    it('restaure la session a partir du cookie', async () => {
      Cookies.set('refreshToken', 'rt');
      apiSimule.post.mockResolvedValue({
        data: { accessToken: 'at2', refreshToken: 'rt2' },
      } as never);
      apiSimule.get.mockResolvedValue({ data: UTILISATEUR } as never);

      await useAuthStore.getState().checkAuth();

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user).toEqual(UTILISATEUR);
    });
  });

  describe('setUser', () => {
    // isAuthenticated se deduit du profil : les deux ne peuvent pas diverger.
    it('lie l’etat de connexion a la presence d’un profil', () => {
      useAuthStore.getState().setUser(UTILISATEUR);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      useAuthStore.getState().setUser(null);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });
});
