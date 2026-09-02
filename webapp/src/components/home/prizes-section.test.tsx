// ===========================================
// Tests unitaires - Section des lots
// ===========================================
// Le point sensible n'est pas l'affichage mais le repli : les visuels viennent
// de Cloudinary via Prize.imageUrl, et retombent sur les images empaquetees si
// l'URL manque. Sans ce repli, une panne du prestataire viderait la page.

import { act, fireEvent, render, screen } from '@testing-library/react';

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

const SECOND_LOT = {
  ...LOT_DISTANT,
  code: 'TEA_DETOX',
  name: 'Thé détox',
  percentage: 20,
  displayOrder: 2,
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

    // Le numero du lot ouvre desormais le titre - « 01. Lot inedit » - et le
    // nom n'est plus un noeud de texte a lui seul.
    expect(screen.getByText(/Lot inédit/)).toBeInTheDocument();
  });

  it('affiche le pourcentage de chances de chaque lot', () => {
    reponse([LOT_DISTANT]);
    render(<PrizesSection />);

    // Espace insecable entre le nombre et le signe pourcent, comme le veut la
    // typographie francaise : la chaine exacte n'est plus « 60% ».
    expect(screen.getByText(/60\s*%/)).toBeInTheDocument();
  });
  // Le defilement automatique est du contenu qui se substitue tout seul : le
  // critere 2.2.2 impose de pouvoir l'arreter, et le survol n'y suffit pas -
  // il n'existe pas au clavier.
  it('fait defiler les lots et laisse mettre le defilement en pause', () => {
    jest.useFakeTimers();
    reponse([LOT_DISTANT, SECOND_LOT]);
    render(<PrizesSection />);

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Infuseur à thé');

    act(() => {
      jest.advanceTimersByTime(6000);
    });
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Thé détox');

    fireEvent.click(screen.getByLabelText(/mettre le défilement des lots en pause/i));
    act(() => {
      jest.advanceTimersByTime(12000);
    });
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Thé détox');

    jest.useRealTimers();
  });

  // Naviguer soi-meme coupe le defilement : sinon le lot choisi disparait sous
  // les yeux quelques secondes plus tard.
  it('arrête le défilement dès que le visiteur navigue lui-même', () => {
    jest.useFakeTimers();
    reponse([LOT_DISTANT, SECOND_LOT]);
    render(<PrizesSection />);

    fireEvent.click(screen.getByLabelText('Lot suivant'));
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Thé détox');

    act(() => {
      jest.advanceTimersByTime(12000);
    });
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Thé détox');

    jest.useRealTimers();
  });
});
