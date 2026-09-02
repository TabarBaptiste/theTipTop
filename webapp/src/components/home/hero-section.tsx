import Image from 'next/image';
import tassesHeroImg from '@/img/tasses_hero_panier.webp';
import heroWaves from '@/img/hero_waves.svg';
import leftLeaves from '@/img/left_leaves.svg';
import rightLeaves from '@/img/right_leaves.svg';
import leftLavenderLeaves from '@/img/left_lavender_leaves.svg';
import rightLavenderLeaves from '@/img/right_lavender_leaves.svg';
import { HeroCTAButtons } from '@/components/home/hero-cta-buttons';

export function HeroSection() {
  return (
    // Le crème plutôt que le blanc : c'est le fond éditorial de la charte, et
    // il donne à la composition l'assise chaude qu'un blanc pur lui refusait.
    // La photo affleure le bas de la section sur la maquette, d'où l'absence
    // de marge basse.
    <section className="relative overflow-hidden bg-cream pb-0 pt-10 md:pt-8">
      <div className="pattern-overlay bg-gradient-to-br from-terracotta-100/20 to-gold-100/20" />

      {/* Décor de la maquette : lisières de feuilles sur les deux bords,
          brins de lavande à mi-hauteur. Masqués avant xl (1280px) : en
          dessous, la marge hors du bloc de texte est trop étroite pour les
          loger sans qu'ils chevauchent le titre et les boutons. */}
      <img
        src={leftLeaves.src}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 hidden h-full w-auto opacity-90 xl:block"
      />
      <img
        src={rightLeaves.src}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-[8%] hidden h-[90%] w-auto opacity-90 xl:block"
      />
      <img
        src={leftLavenderLeaves.src}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-[48%] hidden w-40 -translate-y-1/2 xl:block xl:w-56"
      />
      <img
        src={rightLavenderLeaves.src}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-[28%] hidden w-40 xl:block xl:w-56"
      />

      {/* Les vagues occupent toute la largeur de la page et affleurent le bas
          de la section, comme sur la maquette : la photo, plus étroite, se
          pose par-dessus et les laisse dépasser de chaque côté. */}
      <img
        src={heroWaves.src}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden w-full opacity-70 md:block"
      />

      <div className="container relative mx-auto px-6">
        {/* Contenu centré au-dessus d'une seule photo pleine largeur, conforme
            à la maquette : la grille à deux colonnes précédente partageait la
            vedette entre texte et visuel, alors que le titre porte seul
            l'argument du jeu. */}
        <div className="text-center">
          <p className="font-functional text-[10px] font-bold uppercase tracking-[2px] text-terracotta-600">
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
          <h1 className="mx-auto mt-4 max-w-[782px] font-display text-display text-noir">
            Jeu-concours <span className="whitespace-nowrap text-terracotta-600">Thé Tip Top</span>
            &nbsp;: un an de thé à gagner, 100&nbsp;% des tickets gagnants
          </h1>

          {/* Le paragraphe court sur toute la largeur du contenu sur la
              maquette, et non sur celle du titre : deux lignes pleines plutôt
              que quatre lignes étroites. */}
          <p className="mt-[30px] text-body leading-[24.5px] text-noir/70">
            À l&apos;occasion de l&apos;ouverture de notre 10<sup>e</sup> boutique à Nice, chaque
            participation vous inscrit au tirage au sort d&apos;
            <strong className="font-bold text-noir">un an de thé</strong>, d&apos;une valeur de 360
            €. Et vous ne repartez jamais les mains vides :{' '}
            <strong className="font-bold text-noir">100 % des tickets sont gagnants</strong>.
          </p>

          <div className="flex justify-center">
            <HeroCTAButtons />
          </div>
        </div>

        <div className="relative mt-[52px] aspect-[4/3] w-full overflow-hidden md:aspect-[1129/468]">
          <Image
            src={tassesHeroImg}
            alt="Tasses de thé Tip Top"
            fill
            sizes="(max-width: 1200px) 100vw, 1152px"
            className="object-cover"
            priority
            quality={85}
          />
        </div>
      </div>
    </section>
  );
}
