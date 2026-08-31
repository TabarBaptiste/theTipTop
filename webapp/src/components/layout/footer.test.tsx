// ===========================================
// Tests unitaires - Footer
// ===========================================

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Footer } from './footer';
import { api } from '@/lib/api';

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@/lib/api', () => ({
  api: { post: jest.fn() },
}));

const mockedPost = api.post as jest.Mock;

describe('Footer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedPost.mockResolvedValue({ data: { dejaInscrit: false } });
    render(<Footer />);
  });

  it('renders the brand name', () => {
    expect(screen.getByText('Thé Tip Top')).toBeInTheDocument();
  });

  it('links to the contest rules page', () => {
    expect(screen.getByRole('link', { name: 'Règlement du jeu' })).toHaveAttribute(
      'href',
      '/reglement'
    );
  });

  // Le bloc « Jeu Concours » est le coeur du site : ces liens ont deja saute
  // une fois lors d'une reecriture du footer, on les verrouille.
  it('links to all the contest pages', () => {
    const expected = [
      ['Comment participer', '/#how-it-works'],
      ['Les lots à gagner', '/#prizes'],
      ['Règlement du jeu', '/reglement'],
      ["S'inscrire", '/auth/register'],
    ];
    expected.forEach(([label, href]) => {
      expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href);
    });
  });

  it('links to all the legal pages (RGPD)', () => {
    expect(screen.getByRole('link', { name: 'Mentions légales' })).toHaveAttribute(
      'href',
      '/mentions-legales'
    );
    expect(screen.getByRole('link', { name: 'Politique de confidentialité' })).toHaveAttribute(
      'href',
      '/politique-confidentialite'
    );
    screen.getAllByRole('link', { name: 'CGU' }).forEach((link) => {
      expect(link).toHaveAttribute('href', '/cgu');
    });
    expect(screen.getByRole('link', { name: 'Gestion des cookies' })).toHaveAttribute(
      'href',
      '/gestion-cookies'
    );
  });

  // Le plan du site n'a d'utilite que s'il est atteignable : sans ce lien, il
  // resterait une page orpheline, connue des seuls moteurs.
  it('links to the human-readable sitemap', () => {
    expect(screen.getByRole('link', { name: 'Plan du site' })).toHaveAttribute(
      'href',
      '/plan-du-site'
    );
  });

  it('shows the current year in the copyright', () => {
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  // Le formulaire s'est longtemps contente d'afficher une confirmation sans
  // rien envoyer : un TODO tenait lieu d'implementation.
  describe('inscription a la newsletter', () => {
    const saisirEtEnvoyer = (adresse: string) => {
      fireEvent.change(screen.getByLabelText('Votre adresse e-mail'), {
        target: { value: adresse },
      });
      fireEvent.click(screen.getByRole('button', { name: "S'abonner à la newsletter" }));
    };

    it('transmet l adresse a l API', async () => {
      saisirEtEnvoyer('jean@email.fr');

      await waitFor(() => {
        expect(mockedPost).toHaveBeenCalledWith('/newsletter', { email: 'jean@email.fr' });
      });
    });

    it('confirme puis vide le champ', async () => {
      saisirEtEnvoyer('jean@email.fr');

      await waitFor(() => {
        expect((screen.getByLabelText('Votre adresse e-mail') as HTMLInputElement).value).toBe('');
      });
    });

    it('n envoie rien sur un champ vide', () => {
      fireEvent.click(screen.getByRole('button', { name: "S'abonner à la newsletter" }));

      expect(mockedPost).not.toHaveBeenCalled();
    });

    it('signale une adresse invalide sur un rejet 400', async () => {
      mockedPost.mockRejectedValueOnce({ response: { status: 400 } });
      const { toast } = jest.requireMock('sonner');

      // Format syntaxiquement valide : le champ est de type "email" et le
      // rejet testé ici est un refus serveur, pas la validation du navigateur.
      saisirEtEnvoyer('invalide@email.fr');

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Cette adresse e-mail n'est pas valide");
      });
    });

    it('signale une panne sur toute autre erreur', async () => {
      mockedPost.mockRejectedValueOnce(new Error('network down'));
      const { toast } = jest.requireMock('sonner');

      saisirEtEnvoyer('jean@email.fr');

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("L'inscription a échoué, réessayez dans un instant");
      });
    });
  });
});
