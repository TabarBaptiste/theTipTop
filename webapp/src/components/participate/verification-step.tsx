'use client';

import { useEffect, useState } from 'react';
import { Loader2, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Doit rester aligné sur RG-07 côté API : le serveur refuserait un renvoi
// anticipé, autant que le bouton reste grisé jusque-là.
const RESEND_LOCK_SECONDS = 60;

// Doit rester aligné sur CODE_TTL_HOURS côté API (leads.service.ts) : expiresAt
// vaut toujours lastCodeSentAt + 48h, ce qui permet de retrouver l'instant
// d'envoi réel sans porter lastCodeSentAt en prop.
const CODE_TTL_HOURS = 48;

function computeSecondsLeft(expiresAt: string): number {
  const sentAt = new Date(expiresAt).getTime() - CODE_TTL_HOURS * 60 * 60 * 1000;
  const elapsedMs = Date.now() - sentAt;
  return Math.max(0, Math.ceil((RESEND_LOCK_SECONDS * 1000 - elapsedMs) / 1000));
}

interface Props {
  maskedEmail: string;
  expiresAt: string;
  isVerifying: boolean;
  isResending: boolean;
  /** RG-08 : passé deux renvois, on propose de corriger l'adresse. */
  offerEmailCorrection: boolean;
  /**
   * L'écran sert les deux parcours : confirmer une participation, ou créer un
   * compte. Seul le bouton en dit la différence.
   */
  submitLabel?: string;
  onVerify: (code: string) => void;
  onResend: (newEmail?: string) => void;
}

export function VerificationStep({
  maskedEmail,
  expiresAt,
  isVerifying,
  isResending,
  offerEmailCorrection,
  submitLabel = 'Confirmer ma participation',
  onVerify,
  onResend,
}: Props) {
  const [code, setCode] = useState('');
  const [correctedEmail, setCorrectedEmail] = useState('');
  // Le décompte repart de lui-même à chaque nouvel envoi : la page remonte ce
  // composant via une `key` calée sur expiresAt. Recalculé à partir d'expiresAt
  // plutôt que d'un useState(60) fixe, pour refléter le temps réellement écoulé
  // depuis le dernier envoi même si le composant est remonté (F5, retour arrière).
  const [secondsLeft, setSecondsLeft] = useState(() => computeSecondsLeft(expiresAt));

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const deadline = new Date(expiresAt).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return (
    <div>
      <div className="flex justify-center">
        <div className="rounded-full bg-terracotta-50 p-3">
          <Mail className="h-6 w-6 text-accent" strokeWidth={1.5} />
        </div>
      </div>

      <h1 className="mt-6 text-center font-display text-h2 text-ink">Vérifiez votre email</h1>

      <p className="mt-4 text-center text-sm text-stone-grey">
        Un code à 6 chiffres a été envoyé à <strong className="text-ink">{maskedEmail}</strong>
      </p>

      <div className="mt-6 rounded-soft bg-terracotta-50 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.5} />
          <p className="text-xs leading-relaxed text-ink">
            Ce code est valable jusqu&apos;au <strong>{deadline}</strong>.
          </p>
        </div>
      </div>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onVerify(code);
        }}
      >
        <div>
          <Label htmlFor="verification-code">Code de confirmation</Label>
          <Input
            id="verification-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="mt-1 text-center text-lg tracking-[0.5em]"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isVerifying || code.length !== 6}
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Vérification...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </form>

      <div className="mt-8 border-t border-warm-beige pt-6">
        {offerEmailCorrection ? (
          // RG-08 : après deux échecs, la cause la plus probable est une faute
          // de frappe. On corrige plutôt que de renvoyer une fois de plus.
          <div className="space-y-3">
            <p className="text-sm text-ink">Toujours rien reçu ?</p>
            <p className="text-xs text-stone-grey">
              Vérifiez votre adresse : une faute de frappe est l&apos;explication la plus
              fréquente.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="votre@email.com"
                value={correctedEmail}
                onChange={(e) => setCorrectedEmail(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => onResend(correctedEmail)}
                disabled={isResending || !correctedEmail}
              >
                Corriger
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xs text-stone-grey">Vous n&apos;avez pas reçu le code ?</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => onResend()}
              disabled={isResending || secondsLeft > 0}
            >
              {isResending
                ? 'Envoi...'
                : secondsLeft > 0
                  ? `Renvoyer le code (${secondsLeft} s)`
                  : 'Renvoyer le code'}
            </Button>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-stone-grey">
          Pensez à consulter votre dossier de courriers indésirables.
        </p>
      </div>
    </div>
  );
}
