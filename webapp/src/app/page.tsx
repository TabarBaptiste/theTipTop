import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HeroSection } from '@/components/home/hero-section';
import { PrizesSection } from '@/components/home/prizes-section';
import { HowItWorksSection } from '@/components/home/how-it-works-section';
import { CountdownSection } from '@/components/home/countdown-section';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <HeroSection />

      {/* Countdown */}
      <CountdownSection />

      {/* Lots à gagner */}
      <PrizesSection />

      {/* Comment participer */}
      <HowItWorksSection />

      {/* CTA Final */}
      <section className="bg-tea-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Prêt à tenter votre chance ?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-tea-100">
            100% des tickets sont gagnants ! Inscrivez-vous maintenant et participez 
            au grand jeu-concours Thé Tip Top.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="secondary">
              <Link href="/auth/register">Créer un compte</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-tea-600">
              <Link href="/auth/login">J&apos;ai déjà un compte</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
