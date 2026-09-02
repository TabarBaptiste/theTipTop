import { HeroSection } from '@/components/home/hero-section';
import { CountdownSection } from '@/components/home/countdown-section';
import { GrandPrizeSection } from '@/components/home/grand-prize-section';
import { HowItWorksSection } from '@/components/home/how-it-works-section';
import { PrizesSection } from '@/components/home/prizes-section';
import { WhyUsSection } from '@/components/home/why-us-section';
import { AboutContestSection } from '@/components/home/about-contest-section';
import { Reveal } from '@/components/ui/reveal';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />

      {/* Chaque section apparaît en entrant dans l'écran. Le hero en est exclu :
          il est déjà visible au chargement, l'animer reviendrait à retarder ce
          que le visiteur est venu lire. */}
      <Reveal>
        <CountdownSection />
      </Reveal>
      <Reveal>
        <GrandPrizeSection />
      </Reveal>
      <Reveal>
        <HowItWorksSection />
      </Reveal>
      <Reveal>
        <PrizesSection />
      </Reveal>
      <Reveal>
        <WhyUsSection />
      </Reveal>
      {/* En clôture : reprend les regles essentielles pour le visiteur arrive
          en bas de page, et renvoie vers le reglement et la FAQ. */}
      <Reveal>
        <AboutContestSection />
      </Reveal>
    </div>
  );
}
