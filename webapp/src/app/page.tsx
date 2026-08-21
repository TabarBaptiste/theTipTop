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
      <CountdownSection />
      {/* Placée avant « Comment participer ? » : c'est l'argument le plus fort
          du jeu, il doit être lu avant la mécanique. */}
      <GrandPrizeSection />
      <HowItWorksSection />
      <PrizesSection />
      <WhyUsSection />
      {/* En clôture : reprend les regles essentielles pour le visiteur arrive
          en bas de page, et renvoie vers le reglement et la FAQ. */}
      <AboutContestSection />
    </div>
  );
}
