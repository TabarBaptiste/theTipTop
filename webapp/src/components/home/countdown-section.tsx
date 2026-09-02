'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatFrenchDateTime, formatFrenchDateRange } from '@/lib/french-date';

type GamePhase = 'not_started' | 'active' | 'claim_only' | 'ended';

interface GameConfig {
  startDate: string;
  endDate: string;
  claimEndDate: string;
  isActive: boolean;
  phase: GamePhase;
}

export function CountdownSection() {
  const { data: gameConfig } = useQuery<GameConfig>({
    queryKey: ['game-config'],
    queryFn: async () => {
      const response = await api.get('/game/config');
      return response.data;
    },
    staleTime: Infinity,
  });

  // On dépend de la string ISO pour éviter de recréer un objet Date à chaque render
  const endDateStr = gameConfig?.endDate ?? null;

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    if (!endDateStr) return;

    const endDate = new Date(endDateStr);

    const calculateTimeLeft = () => {
      const now = new Date();
      if (now >= endDate) {
        setIsEnded(true);
        return;
      }
      setTimeLeft({
        days: differenceInDays(endDate, now),
        hours: differenceInHours(endDate, now) % 24,
        minutes: differenceInMinutes(endDate, now) % 60,
        seconds: differenceInSeconds(endDate, now) % 60,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endDateStr]);

  // Les dates viennent de l'API, seule autorité sur le déroulement du jeu. Les
  // pages légales, elles, s'appuient sur les constantes de lib/game-dates :
  // un document juridique doit rester lisible API éteinte.
  const periode =
    gameConfig?.startDate && gameConfig?.endDate
      ? formatFrenchDateRange(new Date(gameConfig.startDate), new Date(gameConfig.endDate))
      : null;

  // Jeu terminé (phase serveur ou countdown écoulé)
  const phase = gameConfig?.phase;
  if (isEnded || phase === 'claim_only' || phase === 'ended') {
    return (
      <section className="bg-terracotta-600 py-6">
        <div className="container mx-auto px-6 text-center">
          {/* L'annonce et le délai tenaient dans un seul paragraphe, sans titre :
              la section n'apparaissait nulle part dans la hiérarchie des titres
              de la page. Séparés, l'un devient le titre, l'autre le détail. */}
          <h2 className="font-display text-lg font-semibold text-white">
            Le jeu-concours est terminé
          </h2>
          <p className="mt-1 text-sm text-white/90">
            {gameConfig?.claimEndDate
              ? `Vous pouvez réclamer vos lots jusqu'au ${formatFrenchDateTime(new Date(gameConfig.claimEndDate))}.`
              : 'La période de réclamation des lots est en cours.'}
          </p>
        </div>
      </section>
    );
  }

  return (
    // Fond blanc et filet gris en pied de section, comme sur la maquette : le
    // beige chaud qui encadrait ce bandeau en haut et en bas n'y figure pas.
    <section className="border-b border-section-line bg-white py-12">
      {/* Le passage en ligne se faisait dès 640 px. Le libellé, le décompte et
          le bouton n'y tiennent pas ensemble - le bouton débordait de la page.
          La ligne attend maintenant d'avoir la largeur pour ses trois blocs ;
          en dessous, ils s'empilent. */}
      <div className="container mx-auto flex flex-col items-center justify-between gap-8 px-6 lg:flex-row">
        <div className="flex flex-col gap-2 text-center lg:text-left">
          {/* Ce libellé titrait déjà la section de fait, sans en avoir le
              balisage : la page passait du h1 du hero au h2 du grand prix en
              sautant ce bandeau. */}
          <h2 className="font-functional text-[12px] font-bold uppercase leading-[18px] tracking-[2px] text-stone-grey">
            Temps restant pour participer
          </h2>
          {periode && <p className="text-[12px] leading-[21px] text-noir">{periode}</p>}
        </div>

        {/* Les deux-points qui séparaient les blocs ne figurent pas sur la
            maquette : le décompte s'y lit en quatre cases posées côte à côte. */}
        <div className="flex items-start gap-6">
          {/* Avant que la config arrive, les valeurs sont à 0 - flash imperceptible */}
          <TimeBlock value={timeLeft.days} label="Jours" />
          <TimeBlock value={timeLeft.hours} label="Heures" />
          <TimeBlock value={timeLeft.minutes} label="Minutes" />
          <TimeBlock value={timeLeft.seconds} label="Secondes" />
        </div>

        {/* Ce bouton mène à la même page que le CTA du hero, et reprend sa
            taille exacte sur la maquette. */}
        <Button asChild size="cta" className="w-full md:w-[246px]">
          <Link href="/participate">Participer maintenant</Link>
        </Button>
      </div>
    </section>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex w-16 flex-col items-center gap-2">
      <span className="flex h-16 w-16 items-center justify-center rounded-soft bg-white font-display text-[36px] font-bold leading-[54px] text-noir">
        {String(value).padStart(2, '0')}
      </span>
      <span className="font-functional text-[10px] uppercase leading-[15px] text-stone-grey">
        {label}
      </span>
    </div>
  );
}
