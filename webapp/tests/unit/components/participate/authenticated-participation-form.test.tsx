// ===========================================
// Tests unitaires - Participation d'un compte deja connecte
// ===========================================
// Chemin le plus court du jeu : l'identite est deja etablie, seul le code est
// demande. Le ticket est consomme des la soumission - une saisie invalide qui
// passerait ferait perdre un code au participant.

import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { AuthenticatedParticipationForm } from '@/components/participate/authenticated-participation-form';

// Le bouton reste desactive tant que la page n'est pas hydratee : sans cette
// simulation, aucune soumission ne partirait et les tests mesureraient ce
// verrou plutot que la validation.
jest.mock('@/lib/hooks/use-is-hydrated', () => ({ useIsHydrated: () => true }));

function afficher(proprietes: Record<string, unknown> = {}) {
  const onSubmit = jest.fn();
  render(
    <AuthenticatedParticipationForm
      firstName="Jean"
      email="jean@email.fr"
      isSubmitting={false}
      onSubmit={onSubmit}
      {...proprietes}
    />,
  );
  return onSubmit;
}

function saisirLeCode(code: string) {
  fireEvent.change(screen.getByLabelText('Code du ticket *'), { target: { value: code } });
}

function accepterLeReglement() {
  fireEvent.click(screen.getAllByRole('checkbox')[0]);
}

function soumettre() {
  fireEvent.click(screen.getByRole('button', { name: /découvrir mon lot/i }));
}

describe('AuthenticatedParticipationForm', () => {
  it('salue le participant', () => {
    afficher();

    expect(screen.getByText(/Jean/)).toBeInTheDocument();
    // expect(screen.getByText(/jean@email\.fr/)).toBeInTheDocument();
  });

  // Le code deja saisi avant un detour par Google ou Facebook est restitue :
  // sans cela, l'utilisateur devrait le retaper au retour.
  it('restitue un code saisi avant un detour par la connexion tierce', () => {
    afficher({ defaultCode: 'ABCDEFGH23' });

    expect(screen.getByLabelText('Code du ticket *')).toHaveValue('ABCDEFGH23');
  });

  it('transmet une saisie valide', async () => {
    const onSubmit = afficher();
    saisirLeCode('ABCDEFGH23');
    accepterLeReglement();
    soumettre();

    // On attend l'appel lui-meme : attendre un bouton deja present rendrait la
    // main avant que la validation n'ait tourne.
    // react-hook-form passe aussi l'evenement en second argument : on inspecte
    // donc la charge utile plutot que la liste complete des arguments.
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      code: 'ABCDEFGH23',
      consentData: true,
    });
  });

  it.each([
    ['ABC', 'trop court'],
    ['abcdefgh23', 'en minuscules'],
  ])('refuse un code %s (%s)', async (code) => {
    const onSubmit = afficher();
    saisirLeCode(code);
    accepterLeReglement();
    soumettre();

    expect(await screen.findByText(/Le code/)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // L'acceptation du reglement est la base legale du traitement.
  it('refuse une participation sans acceptation du reglement', async () => {
    const onSubmit = afficher();
    saisirLeCode('ABCDEFGH23');
    soumettre();

    expect(await screen.findByText(/accepter pour participer/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // Pendant l'envoi, un second clic consommerait un deuxieme code.
  it('verrouille le bouton pendant l’envoi', () => {
    afficher({ isSubmitting: true });

    expect(screen.getByRole('button', { name: /vérification/i })).toBeDisabled();
  });
});
