// ===========================================
// Tests unitaires - Section des lots
// ===========================================
// Le point sensible n'est pas l'affichage mais le repli : les visuels viennent
// de Cloudinary via Prize.imageUrl, et retombent sur les images empaquetees si
// l'URL manque. Sans ce repli, une panne du prestataire viderait la page.

import { render, screen } from '@testing-library/react';

import { PrizesSection } from './prizes-section';

const mockQuery = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useQuery: () => mockQuery(),
}));

jest.mock('@/lib/api', () => ({ api: { get: jest.fn() } }));

const LOT_DISTANT = {
  code: 'INFUSER',
  name: 'Infuseur à thé',
  description: 'Un infuseur',
  imageUrl: 'https://res.cloudinary.com/compte/image/upload/f_auto,q_auto/thetiptop/lots/infuseur',
  value: null,
  percentage: 60,
  displayOrder: 1,
};

function reponse(prizes: unknown[] | undefined, isLoading = false) {
  mockQuery.mockReturnValue({ data: prizes, isLoading });
}

/** Source réellement posée sur la carte du lot. */
function sourceAffichee() {
  return screen.getAllByRole('img')[0].getAttribute('src') ?? '';
}

describe('PrizesSection', () => {
  beforeEach(() => jest.clearAllMocks());

  it('affiche des squelettes pendant le chargement', () => {
    reponse(undefined, true);
    const { container } = render(<PrizesSection />);

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('sert le visuel distant quand l’API en fournit un', () => {
    reponse([LOT_DISTANT]);
    render(<PrizesSection />);

    expect(sourceAffichee()).toContain('res.cloudinary.com');
  });

  // Cas d'une seed sans compte Cloudinary, ou d'un prestataire injoignable :
  // la page doit rester complete.
  it('retombe sur l’image empaquetée quand l’URL distante est absente', () => {
    reponse([{ ...LOT_DISTANT, imageUrl: null }]);
    render(<PrizesSection />);

    const source = sourceAffichee();
    expect(source).not.toContain('res.cloudinary.com');
    expect(source).not.toBe('');
  });

  // Un code de lot inconnu du catalogue local ne doit pas faire disparaitre la
  // carte : l'API reste la source de verite sur la liste des lots.
  it('affiche un lot dont le code est absent du catalogue local', () => {
    reponse([{ ...LOT_DISTANT, code: 'LOT_INEDIT', name: 'Lot inédit' }]);
    render(<PrizesSection />);

    expect(screen.getByText('Lot inédit')).toBeInTheDocument();
  });

  it('affiche le pourcentage de chances de chaque lot', () => {
    reponse([LOT_DISTANT]);
    render(<PrizesSection />);

    expect(screen.getByText('60%')).toBeInTheDocument();
  });
});
