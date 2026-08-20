'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useIsHydrated } from '@/lib/hooks/use-is-hydrated';
import { isPlaceholderEmail } from '@/lib/placeholder-email';
import { api } from '@/lib/api';

const emailSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
});

const codeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Le code comporte six chiffres'),
});

type EmailFormData = z.infer<typeof emailSchema>;
type CodeFormData = z.infer<typeof codeSchema>;

/**
 * Écran de rattachement d'une adresse réelle.
 *
 * Certains comptes Facebook ne transmettent aucune adresse : ils sont créés
 * sous une adresse de substitution qui ne reçoit rien. Tant qu'elle n'est pas
 * remplacée, le titulaire ne peut être prévenu ni d'un lot gagné ni du délai
 * pour le retirer — d'où la vérification, qui interdit aussi de saisir
 * l'adresse d'un tiers.
 */
export default function CompleteEmailPage() {
  const router = useRouter();
  const isHydrated = useIsHydrated();
  const { user, setUser, isAuthenticated } = useAuthStore();

  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailForm = useForm<EmailFormData>({ resolver: zodResolver(emailSchema) });
  const codeForm = useForm<CodeFormData>({ resolver: zodResolver(codeSchema) });

  // Rien à faire ici pour un compte déjà joignable : l'API refuserait de toute
  // façon, autant ne pas afficher un formulaire sans issue.
  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace('/auth/login');
    } else if (!isPlaceholderEmail(user?.email)) {
      router.replace('/dashboard');
    }
  }, [isHydrated, isAuthenticated, user?.email, router]);

  const readApiError = (error: unknown, fallback: string): string => {
    const message = (error as { response?: { data?: { message?: string | string[] } } })?.response
      ?.data?.message;
    return (Array.isArray(message) ? message[0] : message) || fallback;
  };

  const onSubmitEmail = async (data: EmailFormData) => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/email/request', { email: data.email });
      setPendingEmail(response.data.email);
      codeForm.reset();
      toast.success('Code envoyé. Consultez votre boîte de réception.');
    } catch (error) {
      toast.error(readApiError(error, "L'envoi du code a échoué."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitCode = async (data: CodeFormData) => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/email/confirm', { code: data.code });
      if (user) setUser({ ...user, ...response.data });
      toast.success('Adresse confirmée !');
      router.replace('/dashboard');
    } catch (error) {
      toast.error(readApiError(error, 'Code incorrect.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHydrated || !isAuthenticated) return null;

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-md rounded-card bg-white p-8">
        <MailCheck className="mb-6 h-10 w-10 text-terracotta-600" strokeWidth={1.5} />
        <h1 className="font-display text-h2 text-noir">Confirmez votre adresse</h1>

        {pendingEmail === null ? (
          <>
            <p className="mt-3 text-body text-stone-grey">
              Facebook ne nous a transmis aucune adresse e-mail. Sans elle, nous ne pourrons pas
              vous prévenir si vous gagnez un lot, ni vous rappeler le délai pour le retirer.
            </p>

            <form noValidate onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="mt-8 space-y-5">
              <div>
                <Label htmlFor="email">Votre adresse e-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="jean.dupont@email.fr"
                  {...emailForm.register('email')}
                />
                {emailForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-700">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Recevoir un code
              </Button>
            </form>
          </>
        ) : (
          <>
            <p className="mt-3 text-body text-stone-grey">
              Nous avons envoyé un code à six chiffres à{' '}
              <strong className="text-noir">{pendingEmail}</strong>. Saisissez-le ci-dessous pour
              rattacher cette adresse à votre compte.
            </p>

            <form noValidate onSubmit={codeForm.handleSubmit(onSubmitCode)} className="mt-8 space-y-5">
              <div>
                <Label htmlFor="code">Code de confirmation</Label>
                {/* inputMode et autoComplete permettent aux téléphones de
                    proposer le code directement depuis le message reçu. */}
                <Input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  {...codeForm.register('code')}
                />
                {codeForm.formState.errors.code && (
                  <p className="mt-1 text-xs text-red-700">
                    {codeForm.formState.errors.code.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmer
              </Button>

              <button
                type="button"
                onClick={() => setPendingEmail(null)}
                className="w-full text-center text-xs text-stone-grey underline underline-offset-4 hover:text-noir"
              >
                Ce n&apos;est pas la bonne adresse ? En saisir une autre
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
