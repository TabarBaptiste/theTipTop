import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Leaf, Ticket, ShieldCheck } from 'lucide-react';
import tassesHeroImg from '@/img/tasses_hero.jpg';
import { HeroCTAButtons } from '@/components/home/hero-cta-buttons';

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

            <div className="mt-6 flex flex-wrap gap-3">
              <Badge variant="bio">
                <Leaf className="h-4 w-4" strokeWidth={1.5} />
                Bio certifie
              </Badge>
              <Badge variant="location">
                <Ticket className="h-4 w-4" strokeWidth={1.5} />
                500 000 tickets
              </Badge>
              <Badge variant="handmade">
                <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
                100% gagnant
              </Badge>
            </div>

            <HeroCTAButtons />
          </div>

          {/* Hero image */}
          <div className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-card lg:max-w-none">
            <Image
              src={tassesHeroImg}
              alt="Tasses de thé Tip Top"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
              quality={90}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
