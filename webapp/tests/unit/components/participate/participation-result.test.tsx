// ===========================================
// Tests unitaires - Ecran de resultat
// ===========================================
// Dernier ecran du tunnel. Il annonce le lot et, pour un compte cree a la
// volee, propose de choisir un mot de passe. Ce formulaire applique les memes
// exigences que l'inscription classique : le compte cree ici n'est pas un
// compte de seconde zone.

import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { ParticipationResult } from '@/components/participate/participation-result';

const put = jest.fn();
jest.mock('@/lib/api', () => ({ api: { put: (...a: unknown[]) => put(...a) } }));

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

function afficher(proprietes: Record<string, unknown> = {}) {
  render(
    <ParticipationResult
      prizeName="Infuseur à thé"
      code="ABCDEFGH23"
      passwordRequired={false}
      userId="u1"
      {...proprietes}
    />,
  );
}

describe('ParticipationResult', () => {
  beforeEach(() => jest.clearAllMocks());

  it('annonce le lot remporte', () => {
    afficher();

    expect(screen.getByText('Infuseur à thé')).toBeInTheDocument();
    expect(screen.getByText(/Félicitations/)).toBeInTheDocument();
  });

  // Le code est le justificatif a presenter en boutique : il doit rester
  // visible sur cet ecran.
  it('rappelle le code utilise', () => {
    afficher();

    expect(screen.getByText(/ABCDEFGH23/)).toBeInTheDocument();
  });

  it('affiche la valeur du lot quand elle existe', () => {
    afficher({ prizeValue: '39 €' });

    expect(screen.getByText(/39 €/)).toBeInTheDocument();
  });

  // Un compte deja pourvu d'un mot de passe ne doit pas s'en voir redemander un.
  it('ne propose aucun mot de passe a un compte deja constitue', () => {
    afficher({ passwordRequired: false });

    expect(screen.queryByLabelText('Mot de passe')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /voir mes participations/i })).toBeInTheDocument();
  });

  it('propose de securiser un compte cree a la volee', () => {
    afficher({ passwordRequired: true });

    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
  });

  it('refuse deux mots de passe differents', async () => {
    afficher({ passwordRequired: true });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'Motdepasse1!' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), {
      target: { value: 'Autrechose1!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

    expect(await screen.findByText(/ne correspondent pas/i)).toBeInTheDocument();
    expect(put).not.toHaveBeenCalled();
  });

  it('refuse un mot de passe trop faible', async () => {
    afficher({ passwordRequired: true });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'faible' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), {
      target: { value: 'faible' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

    expect(await screen.findByText(/au moins 8 caractères/i)).toBeInTheDocument();
    expect(put).not.toHaveBeenCalled();
  });

  it('enregistre un mot de passe valide puis mene a l’espace personnel', async () => {
    put.mockResolvedValue({});
    afficher({ passwordRequired: true });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'Motdepasse1!' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), {
      target: { value: 'Motdepasse1!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

    // Route dediee, et non PUT /users/:id : la mise a jour de profil refuse le
    // champ mot de passe pour un compte non administrateur, precisement pour
    // qu'il ne puisse pas etre change sans connaitre l'actuel. Le test
    // verrouillait auparavant cet appel, qui echouait donc en 403 des que le
    // parcours etait joue pour de vrai.
    await waitFor(() =>
      expect(put).toHaveBeenCalledWith('/users/u1/password', { newPassword: 'Motdepasse1!' }),
    );
    await waitFor(() => expect(push).toHaveBeenCalledWith('/dashboard'));
  });
});
