import Image from 'next/image';
import tassesHeroImg from '@/img/tasses_hero.webp';
import { HeroCTAButtons } from '@/components/home/hero-cta-buttons';

// Trois nombres suffisent à dire ce qu'est l'opération : sa taille, sa
// promesse, son enjeu. Les badges qu'ils remplacent vendaient le produit
// - bio, artisanal - ce dont la section « Pourquoi nous » se charge déjà.
const CHIFFRES = [
  { valeur: '500 000', libelle: 'tickets en jeu' },
  { valeur: '100 %', libelle: 'de gagnants' },
  { valeur: '360 €', libelle: 'le grand prix' },
];

export function HeroSection() {
  return (
    // La photo était reléguée dans une colonne, à côté du texte, sur un fond
    // blanc : le hero d'un jeu-concours ressemblait à une fiche produit. En
    // pleine largeur sous un voile sombre, elle porte l'annonce.
    <section className="relative isolate overflow-hidden bg-noir text-white">
      <Image
        src={tassesHeroImg}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        priority
        quality={90}
      />

      {/* Le voile s'éclaircit vers la droite, où rien n'est écrit : la photo
          reste lisible sans jamais passer sous le texte. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-noir/95 via-noir/85 to-noir/55"
      />

      <div className="relative container mx-auto px-6 py-20 md:py-28 lg:py-32">
        <div className="max-w-3xl">
          <p className="font-functional text-ui uppercase tracking-[2px] text-gold-400">
            Jeu-concours exclusif
          </p>

          {/* Les deux arguments du jeu se succèdent dans l'ordre où ils
              agissent : le grand prix attire, le ticket gagnant lève le
              risque. Les deux mots-clés imposés restent dans le titre. */}
          <h1 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.08] text-white">
            {/* Espaces insécables devant le deux-points et le signe pourcent :
                sans elles, la ligne se coupe devant « : » ou entre « 100 » et
                « % ». */}
            Jeu-concours{' '}
            <span className="whitespace-nowrap text-gold-400">Thé Tip Top</span>&nbsp;: un an de thé à
            gagner, 100&nbsp;% des tickets gagnants
          </h1>

          <p className="mt-6 max-w-xl text-body leading-relaxed text-white/85">
            À l&apos;occasion de l&apos;ouverture de notre 10<sup>e</sup> boutique à Nice, chaque
            participation vous inscrit au tirage au sort d&apos;
            <strong className="text-white">un an de thé</strong>. Et vous ne repartez jamais les
            mains vides : <strong className="text-white">100 % des tickets sont gagnants</strong>.
          </p>

          <HeroCTAButtons />

          <dl className="mt-12 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/15 pt-8">
            {CHIFFRES.map(({ valeur, libelle }) => (
              <div key={libelle}>
                <dt className="font-display text-[clamp(1.25rem,3vw,2.25rem)] font-bold text-gold-400">
                  {valeur}
                </dt>
                <dd className="mt-1 font-functional text-[10px] uppercase tracking-[2px] text-white/70">
                  {libelle}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
