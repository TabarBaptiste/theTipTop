'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { trackCTAClick } from '@/lib/analytics';

export function HeroCTAButtons() {
  return (
    <div className="mt-8 flex flex-col gap-4 sm:flex-row">
      <Button asChild size="lg">
        <Link
          href="/dashboard/participate"
          onClick={() => trackCTAClick('Participer maintenant', 'hero_section')}
        >
          Participer maintenant
        </Link>
      </Button>
      <Button asChild size="lg" variant="outline">
        <Link
          href="/#how-it-works"
          onClick={() => trackCTAClick('Comment ca marche', 'hero_section')}
        >
          Comment ca marche ?
        </Link>
      </Button>
    </div>
  );
}
