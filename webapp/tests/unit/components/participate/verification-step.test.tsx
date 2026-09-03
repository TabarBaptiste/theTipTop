// ===========================================
// Tests unitaires - Etape de verification du code
// ===========================================
// Cet ecran porte trois regles metier fragiles : le verrou de renvoi de 60 s
// (RG-07) qui doit rester coherent avec l'API, le decompte qui repart du bon
// point meme apres un F5, et le geste RG-08 (proposer de corriger l'adresse
// apres deux echecs plutot que de renvoyer indefiniment).

import { act, fireEvent, render, screen } from '@testing-library/react';

import { VerificationStep } from '@/components/participate/verification-step';

const RESEND_LOCK_MS = 60_000;
const CODE_TTL_MS = 48 * 60 * 60 * 1000;

/**
 * Construit un expiresAt qui, evalue au moment de l'appel, donne le nombre de
 * secondes restantes demande. Le decalage d'une demi-seconde evite de tomber
 * pile sur une frontiere d'arrondi (Math.ceil) a cause du temps d'execution.
 */
function expiresAtPour(secondesRestantes: number): string {
  const elapsedMs = RESEND_LOCK_MS - secondesRestantes * 1000 + 500;
  const sentAt = Date.now() - elapsedMs;
  return new Date(sentAt + CODE_TTL_MS).toISOString();
}

function libelleEcheance(expiresAt: string): string {
  return new Date(expiresAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' });
}

const onVerify = jest.fn();
const onResend = jest.fn();

type VerificationStepProps = Parameters<typeof VerificationStep>[0];

function afficher(props: Partial<VerificationStepProps> = {}) {
  return render(
    <VerificationStep
      maskedEmail="j***@email.fr"
      expiresAt={expiresAtPour(60)}
      isVerifying={false}
      isResending={false}
      offerEmailCorrection={false}
      onVerify={onVerify}
      onResend={onResend}
      {...props}
    />,
  );
}

describe('VerificationStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("affiche l'adresse masquee et l'echeance du code", () => {
    const expiresAt = expiresAtPour(60);
    afficher({ expiresAt });

    expect(screen.getByText('j***@email.fr')).toBeInTheDocument();
    expect(screen.getByText(libelleEcheance(expiresAt), { exact: false })).toBeInTheDocument();
  });

  it("ne garde que les chiffres saisis dans le champ code", () => {
    afficher();

    const champ = screen.getByLabelText('Code de confirmation') as HTMLInputElement;
    fireEvent.change(champ, { target: { value: 'a1b2c3' } });

    expect(champ.value).toBe('123');
  });

  it('desactive la confirmation tant que le code ne fait pas 6 chiffres, puis l’active', () => {
    afficher();

    const champ = screen.getByLabelText('Code de confirmation');
    const bouton = screen.getByRole('button', { name: 'Confirmer ma participation' });

    fireEvent.change(champ, { target: { value: '12345' } });
    expect(bouton).toBeDisabled();

    fireEvent.change(champ, { target: { value: '123456' } });
    expect(bouton).toBeEnabled();
  });

  it('transmet le code saisi a la soumission', () => {
    afficher();

    fireEvent.change(screen.getByLabelText('Code de confirmation'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer ma participation' }));

    expect(onVerify).toHaveBeenCalledWith('123456');
  });

  it('utilise le libelle de soumission personnalise', () => {
    afficher({ submitLabel: 'Créer mon compte' });

    fireEvent.change(screen.getByLabelText('Code de confirmation'), {
      target: { value: '123456' },
    });

    expect(screen.getByRole('button', { name: 'Créer mon compte' })).toBeInTheDocument();
  });

  it('affiche un indicateur de chargement et desactive le bouton pendant la verification', () => {
    afficher({ isVerifying: true });

    const bouton = screen.getByRole('button', { name: /Vérification/ });
    expect(bouton).toBeDisabled();
  });

  it('desactive le renvoi et affiche le decompte tant que le delai n’est pas ecoule', () => {
    afficher({ expiresAt: expiresAtPour(45) });

    const bouton = screen.getByRole('button', { name: 'Renvoyer le code (45 s)' });
    expect(bouton).toBeDisabled();
  });

  it('autorise le renvoi une fois le delai ecoule', () => {
    afficher({ expiresAt: expiresAtPour(0) });

    const bouton = screen.getByRole('button', { name: 'Renvoyer le code' });
    expect(bouton).toBeEnabled();

    fireEvent.click(bouton);
    expect(onResend).toHaveBeenCalledWith();
  });

  it('decompte le delai seconde par seconde puis autorise le renvoi', () => {
    const expiresAt = expiresAtPour(3);
    jest.useFakeTimers();
    afficher({ expiresAt });

    expect(screen.getByRole('button', { name: 'Renvoyer le code (3 s)' })).toBeDisabled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByRole('button', { name: 'Renvoyer le code (2 s)' })).toBeDisabled();

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.getByRole('button', { name: 'Renvoyer le code' })).toBeEnabled();
  });

  it("affiche l'envoi en cours et desactive le bouton de renvoi", () => {
    afficher({ expiresAt: expiresAtPour(0), isResending: true });

    expect(screen.getByRole('button', { name: 'Envoi...' })).toBeDisabled();
  });

  // RG-08 : apres deux echecs, on propose de corriger l'adresse plutot que
  // de renvoyer une fois de plus.
  it("propose de corriger l'adresse quand offerEmailCorrection est vrai", () => {
    afficher({ offerEmailCorrection: true });

    expect(screen.getByText('Toujours rien reçu ?')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Renvoyer le code/ }),
    ).not.toBeInTheDocument();
  });

  it('desactive la correction tant qu’aucune adresse n’est saisie, puis l’envoie', () => {
    afficher({ offerEmailCorrection: true });

    const bouton = screen.getByRole('button', { name: 'Corriger' });
    expect(bouton).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText('votre@email.com'), {
      target: { value: 'nouvelle@email.fr' },
    });
    expect(bouton).toBeEnabled();

    fireEvent.click(bouton);
    expect(onResend).toHaveBeenCalledWith('nouvelle@email.fr');
  });

  it('desactive le bouton de correction pendant l’envoi', () => {
    afficher({ offerEmailCorrection: true, isResending: true });

    fireEvent.change(screen.getByPlaceholderText('votre@email.com'), {
      target: { value: 'nouvelle@email.fr' },
    });

    expect(screen.getByRole('button', { name: 'Corriger' })).toBeDisabled();
  });
});
