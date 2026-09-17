// ===========================================
// Tests unitaires - Tableau de bord Admin, carte du grand tirage
// ===========================================
// Une fois le tirage passé, cette carte est le seul endroit où l'administrateur
// retrouve le gagnant : la réponse du tirage n'est conservée nulle part. Ce qui
// compte est donc qu'elle bascule sur le résultat, et que les coordonnées y
// soient directement exploitables.

import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AdminPage from '@/app/admin/page';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({ api: { get: jest.fn(), post: jest.fn() } }));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@/components/gains/delivered-prizes-list', () => ({
  DeliveredPrizesList: () => <section />,
}));

const mockedGet = api.get as jest.Mock;

const statsGlobales = (grandPrizeDrawn: boolean) => ({
  tickets: { total: 500000, used: 120, distributed: 300, available: 499700, usageRate: 0 },
  users: { total: 57, participants: 42, conversionRate: 0 },
  participations: { total: 120, averagePerUser: 2.9 },
  prizes: { delivered: 30, pending: 90, deliveryRate: 25 },
  game: {
    phase: 'ended',
    daysRemaining: 0,
    claimDaysRemaining: 30,
    endDate: '2026-09-25T21:59:59.999Z',
    grandPrizeDrawn,
  },
});

const gagnant = {
  id: 'u1',
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean.dupont@email.fr',
  phone: '0612345678',
};

function repondre(reponses: Record<string, unknown>) {
  const parDefaut: Record<string, unknown> = {
    '/stats': statsGlobales(false),
    '/stats/prizes': { byType: [], total: 0, delivered: 0 },
    '/stats/demographics': { byGender: [], byAge: [] },
    '/stats/timeline': { timeline: [], total: 0, average: 0 },
    '/stats/emailing': { count: 0, users: [] },
    '/grand-prize/can-draw': { canDraw: true, participantsCount: 42 },
    '/grand-prize/winner': { drawn: false },
  };

  mockedGet.mockImplementation((url: string) => {
    const data = url in reponses ? reponses[url] : parDefaut[url];
    return data instanceof Error ? Promise.reject(data) : Promise.resolve({ data });
  });
}

function afficher() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <AdminPage />
    </QueryClientProvider>,
  );
  return client;
}

describe('AdminPage - carte du grand tirage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('propose le tirage tant qu’il n’a pas eu lieu', async () => {
    repondre({});
    afficher();

    expect(
      await screen.findByRole('button', { name: /Effectuer le tirage au sort/i }),
    ).toBeEnabled();
    expect(screen.queryByText('Gagnant')).not.toBeInTheDocument();
  });

  describe('après le tirage', () => {
    it('présente le gagnant avec la date et l’heure du tirage', async () => {
      repondre({
        '/stats': statsGlobales(true),
        '/grand-prize/winner': {
          drawn: true,
          drawnAt: '2026-09-26T12:00:00.000Z',
          winner: gagnant,
          totalParticipants: 42,
        },
      });
      afficher();

      expect(await screen.findByText('Jean Dupont')).toBeInTheDocument();
      expect(screen.getByText('Gagnant')).toBeInTheDocument();
      expect(screen.getByText(/Tirage effectué le 26 septembre 2026/)).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Effectuer le tirage au sort/i }),
      ).not.toBeInTheDocument();
    });

    // Les coordonnées ne sont affichées que pour joindre le gagnant : elles
    // doivent s'ouvrir dans la messagerie ou le téléphone, pas être recopiées.
    it('rend l’email et le téléphone cliquables', async () => {
      repondre({
        '/stats': statsGlobales(true),
        '/grand-prize/winner': { drawn: true, winner: gagnant },
      });
      afficher();

      expect(await screen.findByRole('link', { name: 'jean.dupont@email.fr' })).toHaveAttribute(
        'href',
        'mailto:jean.dupont@email.fr',
      );
      expect(screen.getByRole('link', { name: '0612345678' })).toHaveAttribute(
        'href',
        'tel:0612345678',
      );
    });

    it('omet le lien téléphone quand le gagnant n’en a pas renseigné', async () => {
      repondre({
        '/stats': statsGlobales(true),
        '/grand-prize/winner': { drawn: true, winner: { ...gagnant, phone: null } },
      });
      afficher();

      await screen.findByRole('link', { name: 'jean.dupont@email.fr' });
      expect(document.querySelector('a[href^="tel:"]')).toBeNull();
    });

    // Compte du gagnant supprimé depuis : l'API répond 404. La carte doit
    // rester sur l'état « tirage effectué » sans rouvrir le bouton de tirage.
    it('signale des coordonnées indisponibles si le gagnant est introuvable', async () => {
      repondre({
        '/stats': statsGlobales(true),
        '/grand-prize/winner': new Error('Compte du gagnant introuvable'),
      });
      const client = afficher();

      await waitFor(() =>
        expect(client.getQueryState(['admin-grand-prize-winner'])?.status).toBe('error'),
      );
      expect(screen.getByText('Coordonnées du gagnant indisponibles.')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Effectuer le tirage au sort/i }),
      ).not.toBeInTheDocument();
    });
  });
});
