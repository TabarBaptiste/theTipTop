import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Leaf, Ticket, ShieldCheck } from 'lucide-react';
import tassesHeroImg from '@/img/tasses_hero.webp';
import { HeroCTAButtons } from '@/components/home/hero-cta-buttons';
import { SteamingCup } from '@/components/home/steaming-cup';
import { OrganicClip, TACHES } from '@/components/decor/organic-shape';

export function HeroSection() {
  return (
    // Le crème plutôt que le blanc : c'est le fond éditorial de la charte, et
    // il donne à la composition l'assise chaude qu'un blanc pur lui refusait.
    <section className="relative overflow-hidden bg-cream py-16 md:py-24">
      <OrganicClip id="tache-hero" trace={TACHES.large} />
      <div className="pattern-overlay bg-gradient-to-br from-terracotta-100/20 to-gold-100/20" />

      <div className="container relative mx-auto px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div>
            <p className="mb-3 font-functional text-ui uppercase tracking-[2px] text-terracotta-600">
              Jeu-concours exclusif
            </p>

            {/* « Bienvenue » ouvrait autrefois ce titre sans porter aucune
                valeur de recherche. Les deux arguments du jeu s'y succèdent
                désormais dans l'ordre où ils agissent : le grand prix attire,
                le ticket gagnant lève le risque. Les deux mots-clés imposés par
                le cahier des charges restent dans le titre. */}
            {/* Espaces insécables devant le deux-points et le signe pourcent :
                sans elles, la ligne se coupe entre « 100 » et « % », et le
                deux-points peut ouvrir une ligne. */}
            <h1 className="font-display text-h1 text-noir">
              Jeu-concours{' '}
              <span className="whitespace-nowrap text-terracotta-600">Thé Tip Top</span>&nbsp;: un
              an de thé à gagner, 100&nbsp;% des tickets gagnants
            </h1>

            <p className="mt-6 text-body leading-relaxed text-stone-grey">
              À l&apos;occasion de l&apos;ouverture de notre 10<sup>e</sup> boutique à Nice,
              chaque participation vous inscrit au tirage au sort d&apos;
              <strong className="text-noir">un an de thé</strong>, d&apos;une valeur de 360 €. Et
              vous ne repartez jamais les mains vides :{' '}
              <strong className="text-noir">100 % des tickets sont gagnants</strong>.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Badge variant="bio">
                <Leaf className="h-4 w-4" strokeWidth={1.5} />
                Bio certifié
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

          {/* Composition en deux plans : la photo découpée en tache tient le
              fond, la tasse illustrée passe devant. Une photo seule montrait un
              produit ; superposée, elle devient le décor d'une scène. */}
          <div className="relative mx-auto aspect-square w-full max-w-md lg:max-w-none">
            <div className="absolute right-0 top-0 h-[70%] w-[70%] [clip-path:url(#tache-hero)]">
              <Image
                src={tassesHeroImg}
                alt=""
                fill
                sizes="(max-width: 1024px) 60vw, 30vw"
                className="object-cover"
                priority
                quality={85}
              />
            </div>

            {/* La tasse fume vraiment, ce qu'aucune de nos photos ne permettait
                - toutes sont vues de dessus ou cadrent un contenant fermé. */}
            <div className="absolute bottom-0 left-0 h-[80%] w-[80%]">
              <SteamingCup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
