'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, MailX } from 'lucide-react';

import { api } from '@/lib/api';

type Etat = 'en-cours' | 'desinscrit' | 'lien-invalide' | 'echec';

/**
 * Page de désinscription de la newsletter.
 *
 * Elle agit dès l'arrivée, sans demander de confirmation : le lien vient d'un
 * courriel, son porteur a déjà exprimé son choix en cliquant, et lui opposer
 * un second bouton n'ajouterait qu'un obstacle à un droit qui doit rester
 * simple à exercer.
 *
 * Aucune authentification : un abonné n'a pas de compte. C'est le jeton du
 * lien qui fait foi.
 */
function Desinscription() {
  const parametres = useSearchParams();
  const token = parametres.get('token');

  // L'absence de jeton se connaît dès le rendu : c'est un état initial, pas le
  // résultat d'un effet. Le poser ici évite un rendu en cascade.
  const [etat, setEtat] = useState<Etat>(token ? 'en-cours' : 'lien-invalide');
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let abandonne = false;

    api
      .post('/newsletter/unsubscribe', { token })
      .then((reponse) => {
        if (abandonne) return;
        setEmail(reponse.data.email);
        setEtat('desinscrit');
      })
      .catch((erreur) => {
        if (abandonne) return;
        const status = (erreur as { response?: { status?: number } })?.response?.status;
        setEtat(status === 404 || status === 400 ? 'lien-invalide' : 'echec');
      });

    // Le composant peut être démonté avant la réponse ; sans ce garde-fou, on
    // écrirait dans un état qui n'existe plus.
    return () => {
      abandonne = true;
    };
  }, [token]);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-md rounded-card bg-white p-8">
        <MailX className="mb-6 h-10 w-10 text-terracotta-600" strokeWidth={1.5} />
        <h1 className="font-display text-h2 text-noir">Désinscription</h1>

        {etat === 'en-cours' && (
          <p className="mt-3 flex items-center gap-2 text-body text-stone-grey">
            <Loader2 className="h-4 w-4 animate-spin" />
            Traitement de votre demande…
          </p>
        )}

        {etat === 'desinscrit' && (
          <p className="mt-3 text-body text-stone-grey">
            {email ? (
              <>
                L&apos;adresse <strong className="text-noir">{email}</strong> ne recevra plus notre
                newsletter.
              </>
            ) : (
              <>Vous ne recevrez plus notre newsletter.</>
            )}{' '}
            Vous pouvez vous réinscrire à tout moment depuis le bas de n&apos;importe quelle page.
          </p>
        )}

        {etat === 'lien-invalide' && (
          <p className="mt-3 text-body text-stone-grey">
            Ce lien de désinscription n&apos;est plus valide. Il a peut-être déjà servi, ou été
            tronqué par votre logiciel de messagerie.
          </p>
        )}

        {etat === 'echec' && (
          <p className="mt-3 text-body text-stone-grey">
            La désinscription n&apos;a pas pu aboutir. Réessayez dans quelques instants.
          </p>
        )}

        <Link
          href="/"
          className="mt-8 inline-block text-sm text-terracotta-600 underline underline-offset-4"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}

export default function DesinscriptionPage() {
  // useSearchParams impose une frontière de suspense au pré-rendu.
  return (
    <Suspense fallback={null}>
      <Desinscription />
    </Suspense>
  );
}
