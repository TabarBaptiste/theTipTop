'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { AccountSidebar } from '@/components/dashboard/account-sidebar';
import { useAuthStore } from '@/lib/stores/auth-store';
import { api } from '@/lib/api';

const EMPTY_PASSWORDS = { current: '', next: '', confirm: '' };

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser, isAuthenticated, isLoading: authLoading, logout } = useAuthStore();
  const [isSavingConsent, setIsSavingConsent] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Un compte créé par Google ou Facebook n'a jamais eu de mot de passe : il en
  // définit un, sans avoir d'ancien à fournir. L'API accepte alors la demande
  // sans `currentPassword`, la session suffisant à prouver l'identité.
  //
  // Par défaut on considère qu'il en existe un : tant que le profil n'est pas
  // chargé, mieux vaut demander l'ancien à tort que l'omettre à tort.
  const aUnMotDePasse = user?.hasPassword !== false;

  // Un compte du personnel ne se supprime pas lui-meme : le droit a
  // l'effacement porte sur un compte de participant, pas sur une habilitation
  // d'exploitation. L'API le refuse ; l'interface n'a donc pas a le proposer.
  const estPersonnel = user?.role === 'ADMIN' || user?.role === 'EMPLOYEE';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Retrait du consentement aux communications (RGPD, art. 7-3).
  // Enregistré au changement : un seul interrupteur ne justifie pas un bouton
  // « Enregistrer » que l'utilisateur oublierait de cliquer.
  const handleConsentChange = async (consentEmail: boolean) => {
    if (!user) return;
    setIsSavingConsent(true);
    try {
      const response = await api.put(`/users/${user.id}`, { consentEmail });
      setUser({ ...user, ...response.data });
      toast.success(
        consentEmail
          ? 'Vous recevrez de nouveau nos communications'
          : 'Vous ne recevrez plus de communications commerciales',
      );
    } catch {
      toast.error('Erreur lors de la mise à jour de votre choix');
    } finally {
      setIsSavingConsent(false);
    }
  };

  // Le mot de passe actuel est exigé par l'API : c'est ce qui empêche une
  // session ouverte de verrouiller le compte hors de son titulaire.
  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    // Vérifié ici plutôt que côté serveur : une faute de frappe sur le nouveau
    // mot de passe enfermerait l'utilisateur dehors.
    if (passwords.next !== passwords.confirm) {
      toast.error('Les deux nouveaux mots de passe ne correspondent pas');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.put(`/users/${user.id}/password`, {
        // Omis pour un compte qui n'en a pas encore : le champ n'est alors pas
        // affiché, et l'envoyer vide ferait échouer la validation.
        ...(aUnMotDePasse ? { currentPassword: passwords.current } : {}),
        newPassword: passwords.next,
      });
      setPasswords(EMPTY_PASSWORDS);
      toast.success(
        aUnMotDePasse ? 'Votre mot de passe a été changé' : 'Votre mot de passe a été défini',
      );
    } catch (error: any) {
      const status = error?.response?.status;
      const apiMessage = error?.response?.data?.message;
      const detail = Array.isArray(apiMessage) ? apiMessage[0] : apiMessage;

      if (status === 403) {
        toast.error('Mot de passe actuel incorrect');
      } else {
        toast.error(detail || 'Erreur lors du changement de mot de passe');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Droit d'accès et de portabilité (RGPD, art. 15 et 20).
  const handleExport = async () => {
    if (!user) return;
    setIsExporting(true);
    try {
      const response = await api.get(`/users/${user.id}/export`);
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mes-données-thetiptop-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Vos données ont été téléchargées');
    } catch {
      toast.error("Erreur lors de l'export de vos données");
    } finally {
      setIsExporting(false);
    }
  };

  // Droit à l'effacement (RGPD, art. 17) : soft delete et anonymisation côté API.
  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmed = window.confirm(
      "Supprimer définitivement votre compte ? Vos données personnelles seront anonymisées (RGPD). Cette action est irréversible.",
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await api.delete(`/users/${user.id}`);
      toast.success('Votre compte a été supprimé');
      logout();
      router.push('/');
    } catch {
      toast.error('Erreur lors de la suppression du compte');
      setIsDeleting(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-3.75rem)] bg-surface py-8">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
            {/* Squelette calé sur la forme réelle : un panneau, pas des lignes
                séparées, sinon la mise en page saute au chargement. */}
            <aside>
              <Skeleton className="h-56 w-full rounded-card" />
            </aside>
            <div className="space-y-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.75rem)] bg-surface py-8">
      <div className="container mx-auto px-6">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <AccountSidebar />

          <main className="max-w-2xl">
            <h1 className="font-display text-h2 text-ink">Paramètres</h1>

            {/* --- Mot de passe --- */}
            <section className="mt-8 border-t border-warm-beige pt-6">
              <h2 className="font-display text-h3 text-ink">
                {aUnMotDePasse ? 'Mot de passe' : 'Définir un mot de passe'}
              </h2>
              <p className="mt-1 text-sm text-stone-grey">
                {aUnMotDePasse
                  ? "Le mot de passe actuel vous est demandé : c'est ce qui empêche quelqu'un d'autre de changer le vôtre depuis une session restée ouverte."
                  : "Votre compte a été créé via Google ou Facebook et n'a pas encore de mot de passe. En définir un vous permettra de vous connecter directement, sans passer par eux."}
              </p>

              <form onSubmit={handlePasswordChange} className="mt-4 max-w-sm space-y-4">
                {aUnMotDePasse && (
                  <div>
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={passwords.next}
                    onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-stone-grey">
                    8 caractères minimum, dont une majuscule, une minuscule, un chiffre et un
                    caractère spécial.
                  </p>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  />
                </div>

                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {aUnMotDePasse ? 'Changer mon mot de passe' : 'Définir mon mot de passe'}
                </Button>
              </form>
            </section>

            {/* --- Communications --- */}
            <section className="mt-8 border-t border-warm-beige pt-6">
              <h2 className="font-display text-h3 text-ink">Communications</h2>
              <p className="mt-1 text-sm text-stone-grey">
                Vous pouvez retirer votre consentement à tout moment, sans avoir à vous
                justifier. Cela n&apos;affecte pas vos participations en cours.
              </p>

              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-soft border border-warm-beige bg-surface p-4">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-terracotta-deep"
                  checked={user?.consentEmail ?? false}
                  disabled={isSavingConsent}
                  onChange={(e) => handleConsentChange(e.target.checked)}
                />
                <span className="text-sm text-ink">
                  Je souhaite recevoir les offres et actualités de Thé Tip Top par e-mail.{' '}
                  <span className="mt-1 block text-xs text-stone-grey">
                    Les e-mails liés à vos participations, eux, vous seront toujours envoyés :
                    ils sont nécessaires au jeu-concours.
                  </span>
                </span>
                {isSavingConsent && (
                  <Loader2 className="ml-auto h-4 w-4 shrink-0 animate-spin text-stone-grey" />
                )}
              </label>

              {/* Les cookies se gèrent sur une page dédiée, imposée par leur
                  nature : le choix vaut pour le navigateur, pas pour le compte,
                  et s'exerce sans être connecté. Sans ce renvoi, quelqu'un venu
                  chercher « mes consentements » ici repartirait en croyant les
                  avoir tous vus. */}
              <p className="mt-4 text-sm text-stone-grey">
                Le suivi de mesure d&apos;audience se règle séparément, depuis la{' '}
                <Link
                  href="/gestion-cookies"
                  className="text-accent underline underline-offset-2"
                >
                  gestion des cookies
                </Link>
                . Ce choix est lié à votre navigateur, non à votre compte.
              </p>
            </section>

            {/* --- Donnees personnelles --- */}
            <section className="mt-8 border-t border-warm-beige pt-6">
              <h2 className="font-display text-h3 text-ink">Mes données</h2>
              <p className="mt-1 text-sm text-stone-grey">
                Téléchargez l&apos;intégralité des données que nous détenons sur vous : votre
                profil, vos participations et les lots associés, au format JSON.
              </p>

              <Button
                variant="outline"
                className="mt-4"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" strokeWidth={1.5} />
                )}
                Télécharger mes données
              </Button>
            </section>

            {/* --- Suppression --- */}
            <section className="mt-8 border-t border-warm-beige pt-6">
              <h2 className="font-display text-h3 text-ink">Supprimer mon compte</h2>

              {estPersonnel ? (
                // L'API refuse cette suppression : afficher le bouton
                // reviendrait a promettre une action vouee a echouer. On
                // explique plutot la marche a suivre.
                <p className="mt-1 text-sm text-stone-grey">
                  Votre compte donne accès au back-office : il ne peut pas être supprimé depuis
                  cet écran. Adressez la demande à un autre administrateur, qui procédera à la
                  suppression.
                </p>
              ) : (
                <>
                  <p className="mt-1 text-sm text-stone-grey">
                    Vos données personnelles seront anonymisées. Les participations déjà
                    enregistrées sont conservées de façon anonyme, le règlement du jeu-concours
                    imposant de pouvoir justifier des tirages auprès de l&apos;huissier.
                  </p>

                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="mt-4 flex items-center gap-2 rounded-full border-[1.5px] border-red-700 px-6 py-2 font-functional text-ui font-bold uppercase tracking-[2px] text-red-700 transition-colors hover:bg-red-700 hover:text-white disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    )}
                    Supprimer mon compte
                  </button>
                </>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
