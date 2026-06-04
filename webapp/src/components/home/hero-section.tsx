import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Leaf, Award, ShieldCheck } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      <div className="pattern-overlay bg-gradient-to-br from-terracotta-100/20 to-gold-100/20" />

      <div className="container relative mx-auto px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div>
            <p className="mb-3 font-functional text-ui uppercase tracking-[2px] text-terracotta-deep">
              Jeu-concours exclusif
            </p>

            <h1 className="font-display text-h1 text-noir">
              Bienvenue au jeu-concours{' '}
              <span className="text-terracotta-deep">The Tip Top</span>
            </h1>

            <p className="mt-6 text-body leading-relaxed text-stone-grey">
              A l&apos;occasion de l&apos;ouverture de notre 10eme boutique a Nice,
              participez a notre grand jeu-concours et tentez de remporter de
              nombreux lots. 100% des tickets sont gagnants !
            </p>

            {/* Tags */}
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-pill border border-moss px-3 py-1 font-functional text-[10px] font-semibold uppercase tracking-[2px] text-moss">
                <Leaf className="h-3 w-3" strokeWidth={2} />
                Bio certifie
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-pill border border-gold-500 px-3 py-1 font-functional text-[10px] font-semibold uppercase tracking-[2px] text-gold-500">
                <Award className="h-3 w-3" strokeWidth={2} />
                Artisanal
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-pill border border-terracotta-deep px-3 py-1 font-functional text-[10px] font-semibold uppercase tracking-[2px] text-terracotta-deep">
                <ShieldCheck className="h-3 w-3" strokeWidth={2} />
                100% gagnant
              </span>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/auth/register">
                  Participer maintenant
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/#how-it-works">
                  Comment ca marche ?
                </Link>
              </Button>
            </div>
          </div>

          {/* Image placeholder */}
          <div className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-card lg:max-w-none">
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-terracotta-100 to-warm-beige">
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-terracotta-deep/10">
                  <Leaf className="h-10 w-10 text-terracotta-deep" strokeWidth={1.5} />
                </div>
                <p className="mt-4 font-display text-lg font-semibold text-terracotta-700">
                  Photo a venir
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
