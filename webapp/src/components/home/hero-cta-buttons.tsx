'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { trackCTAClick } from '@/lib/analytics';

export function HeroCTAButtons() {
  return (
    // Les deux boutons partageaient la taille « lg » sur fond blanc : un plein
    // et un contour terracotta y pesaient presque autant, et le visiteur
    // devait choisir entre deux actions d'apparence équivalente. Sur la photo,
    // le plein ressort seul ; le contour blanc reste lisible sans lui disputer
    // la conversion, et descend d'une taille.
    <div className="mt-10 flex flex-col items-stretch gap-4 md:flex-row md:items-center">
      <Button asChild size="xl">
        <Link
          href="/participate"
          onClick={() => trackCTAClick('Participer maintenant', 'hero_section')}
        >
          Participer maintenant
        </Link>
      </Button>
      <Button
        asChild
        size="lg"
        variant="outline"
        className="border-white/70 text-white hover:bg-white hover:text-noir"
      >
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
