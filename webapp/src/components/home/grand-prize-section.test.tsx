// ===========================================
// Tests unitaires - Section du grand tirage
// ===========================================
// Cette section bascule d'une promesse a un resultat le jour du tirage.
// Se tromper de branche annoncerait « un an de the a gagner » alors que le
// gagnant est deja designe. Elle porte aussi un garde-fou discret : le
// compteur de participants ne doit pas s'afficher tant qu'il dessert
// l'argument qu'il est cense servir.

import { render, screen } from '@testing-library/react';

import { GrandPrizeSection } from './grand-prize-section';

const mockQuery = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useQuery: () => mockQuery(),
}));

jest.mock('@/lib/api', () => ({ api: { get: jest.fn() } }));

function reponse(data: unknown, isLoading = false) {
  mockQuery.mockReturnValue({ data, isLoading });
}

describe('GrandPrizeSection', () => {
  beforeEach(() => jest.clearAllMocks());

  it('affiche des squelettes pendant le chargement', () => {
    reponse(undefined, true);
    const { container } = render(<GrandPrizeSection />);

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  describe('avant le tirage', () => {
    it('annonce le lot et invite à participer', () => {
      reponse({ drawn: false });
      render(<GrandPrizeSection />);

      expect(screen.getByRole('heading', { name: /Un an de thé à gagner/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Participer au tirage/i })).toHaveAttribute(
        'href',
        '/participate',
      );
    });

    it('répond aux trois objections du tirage au sort', () => {
      reponse({ drawn: false });
      render(<GrandPrizeSection />);

      expect(screen.getByText(/Inscription automatique/i)).toBeInTheDocument();
      expect(screen.getByText(/Une chance par personne/i)).toBeInTheDocument();
      expect(screen.getByText(/huissier de justice/i)).toBeInTheDocument();
    });

    // Le seuil est la raison d'etre du compteur : en dessous, le chiffre
    // decourage au lieu de rassurer.
    it('tait le nombre de participants tant qu’il est trop faible', () => {
      reponse({ drawn: false, participantsCount: 49 });
      render(<GrandPrizeSection />);

      expect(screen.queryByText(/participants au tirage/i)).not.toBeInTheDocument();
    });

    it('affiche le nombre de participants une fois le seuil atteint', () => {
      reponse({ drawn: false, participantsCount: 50 });
      render(<GrandPrizeSection />);

      expect(screen.getByText(/50 participants au tirage/i)).toBeInTheDocument();
    });

    // L'API a servi les deux noms de champ au fil du temps ; le repli evite un
    // compteur vide sur une reponse encore au format precedent.
    it('retombe sur totalParticipants quand participantsCount est absent', () => {
      reponse({ drawn: false, totalParticipants: 1200 });
      render(<GrandPrizeSection />);

      expect(screen.getByText(/participants au tirage/i)).toBeInTheDocument();
    });
  });

  describe('après le tirage', () => {
    it('bascule sur le résultat et nomme le gagnant', () => {
      reponse({ drawn: true, winner: { firstName: 'Jean', lastName: 'Dupont' } });
      render(<GrandPrizeSection />);

      expect(screen.getByRole('heading', { name: /a trouvé son gagnant/i })).toBeInTheDocument();
      expect(screen.getByText(/Jean Dupont/)).toBeInTheDocument();
      expect(screen.queryByText(/Un an de thé à gagner/i)).not.toBeInTheDocument();
    });

    // Le gagnant peut etre anonymise : la section doit rester lisible sans lui.
    it('reste cohérente quand le gagnant n’est pas communiqué', () => {
      reponse({ drawn: true, winner: null, totalParticipants: 1200 });
      render(<GrandPrizeSection />);

      expect(screen.getByRole('heading', { name: /a trouvé son gagnant/i })).toBeInTheDocument();
      expect(screen.getByText(/participants\./i)).toBeInTheDocument();
    });

    it('mentionne l’huissier même sans décompte de participants', () => {
      reponse({ drawn: true, winner: null });
      render(<GrandPrizeSection />);

      expect(screen.getByText(/huissier de justice\./i)).toBeInTheDocument();
    });
  });
});
