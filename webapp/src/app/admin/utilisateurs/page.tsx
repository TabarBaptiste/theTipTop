'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { ArrowLeft, Gift, Loader2, Pencil, Search, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonList } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import {
  UserEditDialog,
  type EditableUser,
  type UserFormData,
} from '@/components/admin/user-edit-dialog';
import { UserGainsPanel } from '@/components/admin/user-gains-panel';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth-store';

const PAGE_SIZE = 20;

const ROLE_LABELS: Record<string, string> = {
  CLIENT: 'Client',
  EMPLOYEE: 'Employé',
  ADMIN: 'Administrateur',
};

const ROLE_FILTERS = [
  { value: '', label: 'Tous les rôles' },
  { value: 'CLIENT', label: 'Clients' },
  { value: 'EMPLOYEE', label: 'Employés' },
  { value: 'ADMIN', label: 'Administrateurs' },
];

// Réponse de GET /users
interface AdminUser extends EditableUser {
  createdAt: string;
  _count: { participations: number };
}

interface PaginatedUsers {
  data: AdminUser[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.user?.id);

  const [page, setPage] = useState(1);
  // Deux états distincts : la saisie en cours, et le terme effectivement
  // soumis. Interroger l'API à chaque frappe multiplierait les requêtes sur
  // une recherche qui balaie trois colonnes et, pour un code, joint les
  // tickets.
  const [terme, setTerme] = useState('');
  const [recherche, setRecherche] = useState('');
  const [role, setRole] = useState('');

  const [userEnEdition, setUserEnEdition] = useState<AdminUser | null>(null);
  const [userASupprimer, setUserASupprimer] = useState<AdminUser | null>(null);
  const [gainsOuvertsPour, setGainsOuvertsPour] = useState<string | null>(null);

  const { data, isLoading } = useQuery<PaginatedUsers>({
    queryKey: ['admin-users', page, recherche, role],
    queryFn: async () =>
      (
        await api.get('/users', {
          params: {
            page,
            limit: PAGE_SIZE,
            search: recherche || undefined,
            role: role || undefined,
          },
        })
      ).data,
    // Conserve la page précédente pendant le chargement de la suivante, sinon
    // la liste se vide à chaque clic et la hauteur de la carte saute.
    placeholderData: keepPreviousData,
  });

  const users = data?.data ?? [];
  const meta = data?.meta;

  const rafraichirListe = () => queryClient.invalidateQueries({ queryKey: ['admin-users'] });

  const updateMutation = useMutation({
    mutationFn: async ({ id, form }: { id: string; form: UserFormData }) => {
      // Le rôle passe par sa propre route côté API : PUT /users/:id ne
      // l'accepte pas. Il n'est appelé que s'il a changé, pour ne pas écrire
      // sans raison sur un compte dont seul le prénom était corrigé.
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        // Ne pas envoyer de chaînes vides : elles échoueraient la validation
        // class-validator (IsDateString, IsEnum) côté API.
        phone: form.phone || undefined,
        birthDate: form.birthDate || undefined,
        gender: form.gender || undefined,
        consentEmail: form.consentEmail,
      };
      await api.put(`/users/${id}`, payload);

      if (form.role !== userEnEdition?.role) {
        await api.put(`/users/${id}/role`, { role: form.role });
      }
    },
    onSuccess: () => {
      toast.success('Utilisateur mis à jour');
      setUserEnEdition(null);
      rafraichirListe();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message;
      toast.error(Array.isArray(message) ? message[0] : message || 'La mise à jour a échoué');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      toast.success('Compte anonymisé');
      setUserASupprimer(null);
      rafraichirListe();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'La suppression a échoué');
    },
  });

  const reinitialiserFiltres = () => {
    setTerme('');
    setRecherche('');
    setRole('');
    setPage(1);
  };

  const onSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    setRecherche(terme.trim());
  };

  const listeOuVide =
    users.length === 0 ? (
      <p className="py-8 text-center text-sm text-stone-grey">
        {recherche
          ? `Aucun utilisateur ne correspond à « ${recherche} ».`
          : 'Aucun utilisateur enregistré.'}
      </p>
    ) : (
      <ul className="space-y-3">
        {users.map((user) => (
          <li key={user.id} className="rounded-card border border-warm-beige bg-surface p-4">
            {/* Une colonne par défaut, deux à partir de sm. Les trois actions
                côte à côte débordaient de l'écran : sur 375 px, « Supprimer »
                sortait du cadre. */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">
                  {user.firstName} {user.lastName}
                  <span className="ml-2 text-sm font-normal text-stone-grey">
                    {ROLE_LABELS[user.role] ?? user.role}
                  </span>
                </p>
                <p className="truncate text-sm text-stone-grey">{user.email}</p>
                <p className="mt-1 text-sm text-stone-grey">
                  Inscrit le {formatDate(user.createdAt)} · {user._count.participations}{' '}
                  participation{user._count.participations > 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 sm:shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setGainsOuvertsPour(gainsOuvertsPour === user.id ? null : user.id)
                  }
                >
                  <Gift className="mr-1 h-4 w-4" strokeWidth={1.5} />
                  Gains
                </Button>
                <Button variant="outline" size="sm" onClick={() => setUserEnEdition(user)}>
                  <Pencil className="mr-1 h-4 w-4" strokeWidth={1.5} />
                  Modifier
                </Button>
                {/* Un administrateur ne peut pas supprimer son propre compte :
                    l'API le refuse, autant ne pas proposer le geste. */}
                {user.id !== currentUserId && (
                  <Button variant="outline" size="sm" onClick={() => setUserASupprimer(user)}>
                    <Trash2 className="mr-1 h-4 w-4" strokeWidth={1.5} />
                    Supprimer
                  </Button>
                )}
              </div>
            </div>

            {gainsOuvertsPour === user.id && (
              <UserGainsPanel userId={user.id} onClose={() => setGainsOuvertsPour(null)} />
            )}
          </li>
        ))}
      </ul>
    );

  return (
    <div className="min-h-[calc(100vh-3.75rem)] bg-cream py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-stone-grey hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Tableau de bord
          </Link>
          <h1 className="mt-2 font-display text-h1 text-ink">Gestion des utilisateurs</h1>
          <p className="mt-2 text-stone-grey">
            Rechercher, corriger et supprimer un compte, et consulter ses gains
          </p>
        </div>

        {/* Sur mobile, la carte n'encadre rien : elle pose un second fond et
            deux marges intérieures autour d'une liste qui occupe déjà toute la
            largeur. Son habillage n'apparaît qu'à partir de sm, où la largeur
            disponible lui redonne un sens. */}
        <Card className="border-0 bg-transparent sm:border sm:bg-terracotta-pale/30">
          <CardHeader className="px-0 sm:px-6">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" strokeWidth={1.5} />
              Utilisateurs
            </CardTitle>
            <CardDescription>
              La recherche porte sur le nom, le prénom, l&apos;adresse e-mail et le code d&apos;un
              ticket joué.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <form noValidate onSubmit={onSearch} className="space-y-2">
              <Label htmlFor="recherche">Nom, e-mail ou code ticket</Label>
              {/* Le champ occupe sa propre ligne sur mobile ; le filtre et les
                  actions se rangent dessous, et tout revient sur une seule
                  ligne à partir de sm. */}
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Input
                  id="recherche"
                  placeholder="Dupont, jean@email.fr, ABC23DEF45…"
                  className="w-full sm:min-w-48 sm:flex-1"
                  value={terme}
                  onChange={(event) => setTerme(event.target.value)}
                />
                <div className="flex gap-2">
                <select
                  aria-label="Filtrer par rôle"
                  value={role}
                  onChange={(event) => {
                    setPage(1);
                    setRole(event.target.value);
                  }}
                  className="h-10 flex-1 rounded-soft border-[1.5px] border-gold-700 bg-surface px-4 font-functional text-body text-ink focus:border-accent focus:outline-none sm:flex-none"
                >
                  {ROLE_FILTERS.map((filtre) => (
                    <option key={filtre.value} value={filtre.value}>
                      {filtre.label}
                    </option>
                  ))}
                </select>
                <Button type="submit" aria-label="Rechercher">
                  <Search className="h-4 w-4" strokeWidth={1.5} />
                </Button>
                {/* N'apparaît qu'une fois un filtre posé : un bouton toujours
                    visible mais sans effet la moitié du temps se lit comme une
                    action disponible. `recherche` compte autant que `terme` -
                    vider le champ sans resoumettre laisse la liste filtrée. */}
                {(terme || recherche || role) && (
                  <Button
                    type="button"
                    variant="outline"
                    aria-label="Réinitialiser la recherche"
                    onClick={reinitialiserFiltres}
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
                )}
                </div>
              </div>
            </form>

            <div className="mt-6">
              {isLoading ? <SkeletonList count={5} /> : listeOuVide}

              {meta && (
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  total={meta.total}
                  onPageChange={setPage}
                  label={meta.total > 1 ? 'utilisateurs' : 'utilisateur'}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {userEnEdition && (
        <UserEditDialog
          user={userEnEdition}
          isSaving={updateMutation.isPending}
          onCancel={() => setUserEnEdition(null)}
          onSubmit={(form) => updateMutation.mutate({ id: userEnEdition.id, form })}
        />
      )}

      {userASupprimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="titre-suppression-utilisateur"
            className="w-full max-w-md rounded-card bg-surface p-5 shadow-lg sm:p-6"
          >
            <h2 id="titre-suppression-utilisateur" className="font-display text-h3 text-ink">
              Supprimer ce compte ?
            </h2>
            {/* Dire ce que fait réellement la politique de suppression : le
                compte est anonymisé, pas effacé. Les participations restent,
                sans quoi les compteurs du jeu-concours seraient faussés
                a posteriori. */}
            <p className="mt-3 text-sm text-stone-grey">
              Les données personnelles de {userASupprimer.firstName} {userASupprimer.lastName} (
              {userASupprimer.email}) seront effacées et le compte anonymisé, conformément au
              droit à l&apos;effacement. Ses participations sont conservées de façon anonyme.
              Cette action est irréversible.
            </p>
            {/* Le rouge du variant destructive, et non le terracotta de
                l'action principale : une suppression irréversible ne doit pas
                porter la même couleur qu'un « Participer ». Taille réduite,
                sinon les deux boutons remplissent la largeur de la modale et
                l'annulation pèse autant que la suppression. */}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUserASupprimer(null)}
                disabled={deleteMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteMutation.mutate(userASupprimer.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Supprimer définitivement
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
