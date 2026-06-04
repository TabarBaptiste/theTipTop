import { HeroSection } from '@/components/home/hero-section';
import { CountdownSection } from '@/components/home/countdown-section';
import { HowItWorksSection } from '@/components/home/how-it-works-section';
import { PrizesSection } from '@/components/home/prizes-section';
import { WhyUsSection } from '@/components/home/why-us-section';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <CountdownSection />
      <HowItWorksSection />
      <PrizesSection />
      <WhyUsSection />
    </div>
  );
}
