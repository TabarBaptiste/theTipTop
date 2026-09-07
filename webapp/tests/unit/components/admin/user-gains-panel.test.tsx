// ===========================================
// Tests unitaires - UserGainsPanel
// ===========================================

import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserGainsPanel } from '@/components/admin/user-gains-panel';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: { get: jest.fn() },
}));

const mockedGet = api.get as jest.Mock;

const gainRemis = {
  id: 'p1',
  code: 'ABCDEFGH23',
  prizeType: 'INFUSER',
  prize: { name: 'Infuseur à thé', description: 'Un infuseur', value: '12€' },
  participatedAt: '2026-08-10T09:00:00.000Z',
  prizeDelivered: true,
  prizeDeliveredAt: '2026-08-12T14:32:00.000Z',
  deliveryMethod: 'IN_STORE',
};

const gainEnAttente = {
  id: 'p2',
  code: 'JKLMNPQR45',
  prizeType: 'TEA_DETOX',
  prize: { name: 'Thé détox', description: 'Boite 100g', value: '20€' },
  participatedAt: '2026-08-09T09:00:00.000Z',
  prizeDelivered: false,
  prizeDeliveredAt: null,
  deliveryMethod: null,
};

function renderPanel(onClose = jest.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <UserGainsPanel userId="u1" onClose={onClose} />
    </QueryClientProvider>,
  );
}

describe('UserGainsPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('liste les gains et distingue ceux qui restent à remettre', async () => {
    mockedGet.mockResolvedValue({
      data: {
        user: { id: 'u1', firstName: 'Camille', lastName: 'Tran', email: 'camille@thetiptop.fr' },
        data: [gainRemis, gainEnAttente],
        meta: { total: 2, delivered: 1 },
      },
    });

    renderPanel();

    expect(await screen.findByText('Infuseur à thé')).toBeInTheDocument();
    expect(screen.getByText('Thé détox')).toBeInTheDocument();
    expect(screen.getByText(/2 participations · 1 lot remis/)).toBeInTheDocument();
    expect(screen.getByText('✓ Remis')).toBeInTheDocument();
    expect(screen.getByText('En attente de remise')).toBeInTheDocument();
    expect(screen.getByText('En boutique')).toBeInTheDocument();
    expect(mockedGet).toHaveBeenCalledWith('/users/u1/gains');
  });

  it("annonce l'absence de participation plutôt qu'une liste vide", async () => {
    mockedGet.mockResolvedValue({
      data: {
        user: { id: 'u1', firstName: 'Camille', lastName: 'Tran', email: 'camille@thetiptop.fr' },
        data: [],
        meta: { total: 0, delivered: 0 },
      },
    });

    renderPanel();

    expect(await screen.findByText(/aucune participation/i)).toBeInTheDocument();
  });

  it('referme le panneau à la demande', async () => {
    const onClose = jest.fn();
    mockedGet.mockResolvedValue({
      data: {
        user: { id: 'u1', firstName: 'Camille', lastName: 'Tran', email: 'camille@thetiptop.fr' },
        data: [],
        meta: { total: 0, delivered: 0 },
      },
    });

    renderPanel(onClose);

    fireEvent.click(await screen.findByLabelText('Fermer les gains'));

    expect(onClose).toHaveBeenCalled();
  });
});
