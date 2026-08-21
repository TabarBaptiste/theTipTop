// ===========================================
// Tests unitaires - Bandeau de decompte
// ===========================================
// Ce bandeau change de discours selon la phase du jeu. Se tromper de phase
// afficherait « il reste X jours pour participer » apres la cloture, ou
// masquerait le delai de reclamation au moment ou il devient la seule
// information utile.

import { render, screen } from '@testing-library/react';

import { CountdownSection } from './countdown-section';

const mockQuery = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useQuery: () => mockQuery(),
}));

jest.mock('@/lib/api', () => ({ api: { get: jest.fn() } }));

const DEMAIN = new Date(Date.now() + 86_400_000).toISOString();
const HIER = new Date(Date.now() - 86_400_000).toISOString();

function config(surcharges: Record<string, unknown> = {}) {
  mockQuery.mockReturnValue({
    data: {
      startDate: '2026-08-31T22:00:00.000Z',
      endDate: DEMAIN,
      claimEndDate: '2026-10-30T22:59:59.999Z',
      isActive: true,
      phase: 'active',
      ...surcharges,
    },
  });
}

describe('CountdownSection', () => {
  beforeEach(() => jest.clearAllMocks());

  it('annonce la période pendant que le jeu court', () => {
    config();
    render(<CountdownSection />);

    expect(screen.getByText(/Temps restant pour participer/i)).toBeInTheDocument();
    expect(screen.getByText(/^Du /)).toBeInTheDocument();
  });

  // Apres la cloture, seul le delai de reclamation compte encore.
  it.each(['claim_only', 'ended'])('bascule sur la réclamation en phase %s', (phase) => {
    config({ phase });
    render(<CountdownSection />);

    expect(screen.getByText(/jeu-concours est terminé/i)).toBeInTheDocument();
    expect(screen.getByText(/réclamer vos lots/i)).toBeInTheDocument();
  });

  // La date de fin passee doit suffire, meme si la phase renvoyee par l'API
  // n'a pas encore ete recalculee.
  it('bascule aussi quand la date de clôture est dépassée', () => {
    config({ endDate: HIER, phase: 'active' });
    render(<CountdownSection />);

    expect(screen.getByText(/jeu-concours est terminé/i)).toBeInTheDocument();
  });

  // Sans date de reclamation, on ne doit pas afficher « jusqu'au undefined ».
  it('reste intelligible si la date de réclamation manque', () => {
    config({ phase: 'ended', claimEndDate: undefined });
    render(<CountdownSection />);

    expect(screen.getByText(/période de réclamation des lots est en cours/i)).toBeInTheDocument();
    expect(screen.queryByText(/undefined/i)).not.toBeInTheDocument();
  });

  // Avant que la requete n'aboutisse, le bandeau doit rester silencieux plutot
  // que d'annoncer une periode inventee.
  it('n’invente aucune période tant que la configuration n’est pas chargée', () => {
    mockQuery.mockReturnValue({ data: undefined });
    render(<CountdownSection />);

    expect(screen.queryByText(/^Du /)).not.toBeInTheDocument();
  });
});
