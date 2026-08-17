'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  ParticipationForm,
  type ParticipationFormData,
} from '@/components/participate/participation-form';
import { VerificationStep } from '@/components/participate/verification-step';
import { ParticipationResult } from '@/components/participate/participation-result';

interface InitiateResponse {
  leadId: string;
  maskedEmail: string;
  expiresAt: string;
}

interface ResendResponse {
  maskedEmail: string;
  expiresAt: string;
  shouldOfferEmailCorrection: boolean;
}

interface VerifyResponse {
  user: { id: string };
  accessToken: string;
  refreshToken: string;
  passwordRequired: boolean;
  participation: {
    code: string;
    prize: { name: string; value?: string };
  };
}

type Step = 'form' | 'verify' | 'result';

export default function ParticipatePage() {
  const { setTokens, setUser } = useAuthStore();

  const [step, setStep] = useState<Step>('form');
  const [pending, setPending] = useState<InitiateResponse | null>(null);
  const [offerEmailCorrection, setOfferEmailCorrection] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);

  const initiate = useMutation({
    mutationFn: async (data: ParticipationFormData) => {
      // Un champ facultatif laissé vide arrive ici en chaîne vide. Côté API,
      // @IsOptional() ne saute que undefined : une chaîne vide serait validée
      // comme une date ou un téléphone, et rejetée. On les retire donc.
      const { data: response } = await api.post<InitiateResponse>('/participations/initiate', {
        ...data,
        phone: data.phone || undefined,
        birthDate: data.birthDate || undefined,
        gender: data.gender || undefined,
        // website (honeypot) est transmis tel quel : c'est l'API qui le
        // contrôle, le formulaire n'est qu'un premier filet.
      });
      return response;
    },
    onSuccess: (data) => {
      setPending(data);
      setStep('verify');
    },
    onError: (error: unknown) => {
      toast.error(readApiError(error, "Impossible d'enregistrer votre participation"));
    },
  });

  const resend = useMutation({
    mutationFn: async (newEmail?: string) => {
      const { data } = await api.post<ResendResponse>('/participations/resend', {
        leadId: pending!.leadId,
        ...(newEmail ? { email: newEmail } : {}),
      });
      return data;
    },
    onSuccess: (data) => {
      // maskedEmail et expiresAt changent : la marche arrière du décompte de
      // 60 s côté composant repart de zéro.
      setPending((prev) =>
        prev ? { ...prev, maskedEmail: data.maskedEmail, expiresAt: data.expiresAt } : prev,
      );
      setOfferEmailCorrection(data.shouldOfferEmailCorrection);
      toast.success('Un nouveau code vous a été envoyé');
    },
    onError: (error: unknown) => {
      toast.error(readApiError(error, "Le renvoi n'a pas abouti"));
    },
  });

  const verify = useMutation({
    mutationFn: async (code: string) => {
      const { data } = await api.post<VerifyResponse>('/participations/verify', {
        leadId: pending!.leadId,
        code,
      });
      return data;
    },
    onSuccess: (data) => {
      // La session est ouverte immédiatement : l'API renvoie déjà le profil,
      // inutile de rappeler /auth/me.
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user as never);
      setResult(data);
      setStep('result');
    },
    onError: (error: unknown) => {
      toast.error(readApiError(error, 'Code invalide ou expiré'));
    },
  });

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-xl sm:rounded-card sm:border sm:border-warm-beige sm:bg-white sm:p-8 sm:shadow-sm">
        {step === 'form' && (
          <>
            <h1 className="font-display text-h2 text-noir">Participer au jeu-concours</h1>
            <p className="mt-2 text-sm text-stone-grey">
              Saisissez le code de votre ticket de caisse. Aucun compte n&apos;est nécessaire
              pour commencer.
            </p>

            <ParticipationForm
              onSubmit={(data) => initiate.mutate(data)}
              isSubmitting={initiate.isPending}
            />

            <p className="mt-6 text-center text-xs text-stone-grey">
              Vous avez déjà un compte ?{' '}
              <Link href="/auth/login" className="font-semibold text-terracotta-deep hover:underline">
                Se connecter
              </Link>
            </p>
          </>
        )}

        {step === 'verify' && pending && (
          <VerificationStep
            // Un nouvel envoi produit une nouvelle échéance : le composant est
            // remonté, ce qui relance le décompte de 60 s sans effet de bord.
            key={pending.expiresAt}
            maskedEmail={pending.maskedEmail}
            expiresAt={pending.expiresAt}
            isVerifying={verify.isPending}
            isResending={resend.isPending}
            offerEmailCorrection={offerEmailCorrection}
            onVerify={(code) => verify.mutate(code)}
            onResend={(newEmail) => resend.mutate(newEmail)}
          />
        )}

        {step === 'result' && result && (
          <ParticipationResult
            prizeName={result.participation.prize.name}
            prizeValue={result.participation.prize.value}
            code={result.participation.code}
            passwordRequired={result.passwordRequired}
            userId={result.user.id}
          />
        )}
      </div>
    </div>
  );
}

/**
 * L'API renvoie des messages métier précis (code déjà réservé, délai de
 * renvoi non écoulé...). Les afficher tels quels vaut mieux qu'un message
 * générique qui laisserait l'utilisateur sans piste.
 */
function readApiError(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response
    ?.data?.message;
  if (Array.isArray(message)) return message[0] ?? fallback;
  return message ?? fallback;
}
