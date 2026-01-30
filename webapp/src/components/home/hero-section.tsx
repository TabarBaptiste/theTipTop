import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sparkles, Gift, Trophy } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-tea-50 to-white py-20 md:py-32">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-tea-200 opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gold-200 opacity-30 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gold-100 px-4 py-2 text-sm font-medium text-gold-700">
              <Sparkles className="h-4 w-4" />
              100% des tickets sont gagnants !
            </div>
            
            <h1 className="font-display text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
              Grand Jeu Concours
              <span className="block text-tea-600">Thé Tip Top</span>
            </h1>
            
            <p className="mt-6 text-lg text-gray-600 md:text-xl">
              À l&apos;occasion de l&apos;ouverture de notre 10ème boutique, 
              participez à notre grand jeu-concours et tentez de remporter 
              <strong className="text-tea-700"> 1 an de thé gratuit</strong> !
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Button asChild size="lg" className="gap-2">
                <Link href="/auth/register">
                  <Gift className="h-5 w-5" />
                  Participer maintenant
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link href="/#how-it-works">
                  Comment ça marche ?
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-tea-600 md:text-3xl">500 000</div>
                <div className="text-sm text-gray-500">Tickets à gagner</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-tea-600 md:text-3xl">100%</div>
                <div className="text-sm text-gray-500">Gagnants</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-tea-600 md:text-3xl">360€</div>
                <div className="text-sm text-gray-500">Grand prix</div>
              </div>
            </div>
          </div>

          {/* Image placeholder */}
          <div className="relative mx-auto aspect-square w-full max-w-md lg:max-w-none">
            <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-gradient-to-br from-tea-100 to-tea-200">
              <div className="text-center">
                <Trophy className="mx-auto h-24 w-24 text-tea-600" />
                <p className="mt-4 font-display text-2xl font-bold text-tea-800">
                  Tentez votre chance !
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
