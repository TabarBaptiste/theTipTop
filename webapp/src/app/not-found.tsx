import type { Metadata } from 'next';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Page introuvable',
};

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center bg-cream px-6 py-24 text-center">
      <Leaf
        size={64}
        strokeWidth={1.5}
        className="mb-8 text-accent opacity-20"
      />
      {/* terracotta-600 et non -deep : sur le crème, -deep plafonne a 3.81:1,
          sous le minimum AA de 4.5:1 exige pour du petit texte. La nuance 600
          atteint 4.61:1 pour un ecart de teinte imperceptible. */}
      <p className="mb-4 font-functional text-ui uppercase text-accent">
        Erreur 404
      </p>
      <h1 className="mb-3 font-editorial text-h1 text-ink">
        Cette page n&apos;existe pas
      </h1>
      <p className="mb-10 max-w-md font-editorial italic text-base text-stone-grey">
        Peut-être que le rituel du thé a emporté cette page vers d&apos;autres horizons méditerranéens.
      </p>
      {/* Le composant du design system plutot qu'un lien restyle a la main :
          les memes classes recopiees ici divergeraient au premier changement
          de charte. */}
      <Button asChild>
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
    </section>
  );
}
