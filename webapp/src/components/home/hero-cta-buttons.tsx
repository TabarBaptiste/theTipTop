'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { trackCTAClick } from '@/lib/analytics';

export function HeroCTAButtons() {
  return (
    // Les deux boutons partageaient la taille « lg » : plein contre contour,
    // ils pesaient presque autant, et le visiteur devait choisir entre deux
    // actions d'apparence equivalente. « Participer » prend la taille au-dessus,
    // « Comment ca marche » descend d'un cran - il reste accessible sans
    // disputer la conversion.
    // Le passage en ligne se faisait dès 640 px, où les deux boutons agrandis
    // ne tiennent plus : le second sortait de la section, qui le rognait au
    // lieu de le laisser déborder. Il attend 768 px.
    <div className="mt-8 flex flex-col items-stretch gap-4 md:flex-row md:items-center">
      <Button asChild size="xl">
        <Link
          href="/participate"
          onClick={() => trackCTAClick('Participer maintenant', 'hero_section')}
        >
          Participer maintenant
        </Link>
      </Button>
      <Button asChild size="lg" variant="outline">
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
