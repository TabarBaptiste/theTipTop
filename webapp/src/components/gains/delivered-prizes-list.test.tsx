// ===========================================
// Tests unitaires - DeliveredPrizesList
// ===========================================

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DeliveredPrizesList } from './delivered-prizes-list';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: { get: jest.fn() },
}));

const mockedGet = api.get as jest.Mock;

const deliveredPrize = {
  id: 'p1',
  code: 'ABCDEFGH23',
  prizeType: 'INFUSER',
  prize: { name: 'Infuseur à thé', description: 'Un infuseur', value: null },
  user: { id: 'u1', email: 'camille@thetiptop.fr', firstName: 'Camille', lastName: 'Tran' },
  prizeDeliveredAt: '2026-08-12T14:32:00.000Z',
  deliveredBy: 'Marie D.',
  deliveryMethod: 'IN_STORE',
};

function renderList() {
  // retry: false, sinon un echec de requete rallonge inutilement les tests.
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <DeliveredPrizesList />
    </QueryClientProvider>,
  );
}

describe('DeliveredPrizesList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche une remise avec son client, son code et son auteur', async () => {
    mockedGet.mockResolvedValue({
      data: {
        data: [deliveredPrize],
        meta: { total: 234, page: 1, limit: 20, totalPages: 12 },
      },
    });

    renderList();

    expect(await screen.findByText('Camille Tran')).toBeInTheDocument();
    expect(screen.getByText('ABCDEFGH23')).toBeInTheDocument();
    expect(screen.getByText('Infuseur à thé')).toBeInTheDocument();
    // La methode de remise et l employe sont rendus dans la meme ligne.
    expect(screen.getByText(/En boutique · Marie D\./)).toBeInTheDocument();
    expect(screen.getByText('Page 1 sur 12')).toBeInTheDocument();
  });

  it('demande la page suivante au clic', async () => {
    mockedGet.mockResolvedValue({
      data: {
        data: [deliveredPrize],
        meta: { total: 234, page: 1, limit: 20, totalPages: 12 },
      },
    });

    renderList();
    await screen.findByText('Camille Tran');

    fireEvent.click(screen.getByLabelText('Page suivante'));

    await waitFor(() => {
      expect(mockedGet).toHaveBeenLastCalledWith('/gains/history', {
        params: { page: 2, limit: 20 },
      });
    });
  });

  it('annonce une liste vide plutot qu une carte muette', async () => {
    mockedGet.mockResolvedValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } },
    });

    renderList();

    expect(await screen.findByText(/Aucun lot n'a encore été remis/)).toBeInTheDocument();
    // Le compteur de pagination repeterait l information : il doit disparaitre.
    expect(screen.queryByText(/lots remis/)).not.toBeInTheDocument();
  });
});
