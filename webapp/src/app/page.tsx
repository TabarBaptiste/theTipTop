import { HeroSection } from '@/components/home/hero-section';
import { CountdownSection } from '@/components/home/countdown-section';
import { GrandPrizeSection } from '@/components/home/grand-prize-section';
import { HowItWorksSection } from '@/components/home/how-it-works-section';
import { PrizesSection } from '@/components/home/prizes-section';
import { WhyUsSection } from '@/components/home/why-us-section';
import { AboutContestSection } from '@/components/home/about-contest-section';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />

      {/* La page s'organise autour du tirage. Il suit immédiatement le hero,
          dont il développe la promesse : le visiteur lit l'argument le plus
          fort avant toute mécanique, et la section noire lui donne le poids
          visuel qui lui revient.

          Le compte à rebours le suivait auparavant : il coupait le fil entre
          l'annonce et son développement, alors qu'il n'a de sens qu'une fois
          l'enjeu compris. */}
      <GrandPrizeSection />
      <CountdownSection />
      <HowItWorksSection />
      <PrizesSection />
      <WhyUsSection />
      {/* En clôture : reprend les regles essentielles pour le visiteur arrive
          en bas de page, et renvoie vers le reglement et la FAQ. */}
      <AboutContestSection />
    </div>
  );
}
