'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { trackCTAClick } from '@/lib/analytics';

export function HeroCTAButtons() {
  return (
    // Les deux boutons ont la même hauteur sur la maquette - 40 px - et se
    // distinguent par le remplissage, non par la taille. Leurs largeurs y sont
    // fixes ; sous md ils s'empilent et prennent celle de l'écran, où deux
    // libellés de cette longueur ne tiennent pas côte à côte.
    <div className="mt-8 flex w-full flex-col items-stretch gap-4 md:w-auto md:flex-row md:items-center md:gap-9">
      <Button asChild size="cta" className="md:w-[246px]">
        <Link
          href="/participate"
          onClick={() => trackCTAClick('Participer maintenant', 'hero_section')}
        >
          Participer maintenant
        </Link>
      </Button>
      <Button asChild size="cta" variant="outline" className="md:w-[275px]">
        <Link
          href="/#how-it-works"
          onClick={() => trackCTAClick('Comment ça marche', 'hero_section')}
        >
          Comment ça marche ?
        </Link>
      </Button>
    </div>
  );
}
