// ===========================================
// Tests unitaires - Formulaire de participation anonyme
// ===========================================
// C'est le tunnel de conversion du jeu-concours. Ses regles de validation
// doublent celles du DTO cote API : les relacher ici ne ferait pas passer une
// saisie invalide, mais renverrait l'utilisateur vers une erreur serveur au
// lieu de la lui signaler tout de suite.

import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { ParticipationForm } from '@/components/participate/participation-form';

const mockHydrate = jest.fn(() => true);
jest.mock('@/lib/hooks/use-is-hydrated', () => ({
  useIsHydrated: () => mockHydrate(),
}));

/** Au moins un message d'erreur affiche : preuve que la validation a rejete. */
async function attendreUnRefus(conteneur: HTMLElement) {
  await waitFor(() =>
    expect(conteneur.querySelectorAll('p.text-red-600').length).toBeGreaterThan(0),
  );
}

/** Remplit le formulaire avec une saisie valide, puis applique les ecarts voulus. */
function remplir(ecarts: Record<string, string> = {}) {
  const valeurs: Record<string, string> = {
    'Code du ticket *': 'ABCDEFGH23',
    'Nom *': 'Dupont',
    'Prénom *': 'Jean',
    'Adresse email *': 'jean.dupont@email.fr',
    ...ecarts,
  };

  for (const [libelle, valeur] of Object.entries(valeurs)) {
    const champ = screen.getByLabelText(libelle);
    fireEvent.change(champ, { target: { value: valeur } });
  }
}

function accepterLeReglement() {
  const cases = screen.getAllByRole('checkbox');
  fireEvent.click(cases[0]);
}

describe('ParticipationForm', () => {
  const onSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockHydrate.mockReturnValue(true);
  });

  // Sans hydratation, React n'intercepte pas la soumission : le navigateur
  // ferait un envoi natif en GET et recopierait email, telephone et date de
  // naissance dans l'URL, donc dans l'historique et les journaux serveur.
  it('interdit la soumission tant que la page n’est pas hydratée', () => {
    mockHydrate.mockReturnValue(false);
    render(<ParticipationForm onSubmit={onSubmit} isSubmitting={false} />);

    expect(screen.getByRole('button', { name: /participer/i })).toBeDisabled();
  });

  it('active la soumission une fois la page hydratée', () => {
    render(<ParticipationForm onSubmit={onSubmit} isSubmitting={false} />);

    expect(screen.getByRole('button', { name: /participer/i })).toBeEnabled();
  });

  it('transmet une saisie valide', async () => {
    render(<ParticipationForm onSubmit={onSubmit} isSubmitting={false} />);
    remplir();
    accepterLeReglement();
    fireEvent.click(screen.getByRole('button', { name: /participer/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      code: 'ABCDEFGH23',
      email: 'jean.dupont@email.fr',
      consentData: true,
    });
  });

  // Le code fait exactement dix caracteres alphanumeriques majuscules : c'est
  // la regle RG du cahier des charges, reprise a l'identique cote serveur.
  it.each([
    ['ABC', 'trop court'],
    ['ABCDEFGH234', 'trop long'],
    ['abcdefgh23', 'en minuscules'],
    ['ABCDEF-H23', 'avec un tiret'],
  ])('refuse un code %s (%s)', async (code) => {
    const { container } = render(<ParticipationForm onSubmit={onSubmit} isSubmitting={false} />);
    remplir({ 'Code du ticket *': code });
    accepterLeReglement();
    fireEvent.click(screen.getByRole('button', { name: /participer/i }));

    await attendreUnRefus(container);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // Le formulaire porte noValidate : la validation native du navigateur est
  // ecartee au profit de zod, pour que toutes les erreurs s'affichent de la
  // meme facon. Ce test verifie le message de l'application, pas une bulle
  // native que rien ne permettrait de styler ni de traduire.
  it('refuse une adresse email invalide avec le message de l’application', async () => {
    render(<ParticipationForm onSubmit={onSubmit} isSubmitting={false} />);
    remplir({ 'Adresse email *': 'pas-une-adresse' });
    accepterLeReglement();
    fireEvent.click(screen.getByRole('button', { name: /participer/i }));

    expect(await screen.findByText('Adresse email invalide')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // Le reglement depose exige la majorite. Sans ce refus, un mineur pourrait
  // remporter un lot qu'il ne pourrait pas reclamer.
  // Le reglement depose exige la majorite. L'API la controle egalement : ce
  // refus-ci sert a le dire tout de suite, dans la langue du site.
  it('refuse une date de naissance de mineur avec le message de l’application', async () => {
    render(<ParticipationForm onSubmit={onSubmit} isSubmitting={false} />);
    const mineur = `${new Date().getFullYear() - 15}-01-01`;
    remplir();
    fireEvent.change(screen.getByLabelText(/date de naissance/i), { target: { value: mineur } });
    accepterLeReglement();
    fireEvent.click(screen.getByRole('button', { name: /participer/i }));

    expect(await screen.findByText(/majeur pour participer/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // L'acceptation du reglement est la base legale du traitement : elle ne peut
  // pas etre optionnelle.
  it('refuse une participation sans acceptation du règlement', async () => {
    render(<ParticipationForm onSubmit={onSubmit} isSubmitting={false} />);
    remplir();
    fireEvent.click(screen.getByRole('button', { name: /participer/i }));

    await waitFor(() =>
      expect(screen.getByText(/accepter pour participer/i)).toBeInTheDocument(),
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('refuse un numéro de téléphone mal formé', async () => {
    render(<ParticipationForm onSubmit={onSubmit} isSubmitting={false} />);
    remplir();
    fireEvent.change(screen.getByLabelText(/téléphone/i), { target: { value: '12345' } });
    accepterLeReglement();
    fireEvent.click(screen.getByRole('button', { name: /participer/i }));

    await waitFor(() =>
      expect(screen.getByText('Numéro de téléphone invalide')).toBeInTheDocument(),
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
