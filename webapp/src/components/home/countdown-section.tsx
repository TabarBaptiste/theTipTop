'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

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

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
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
        days:    differenceInDays(endDate, now),
        hours:   differenceInHours(endDate, now) % 24,
        minutes: differenceInMinutes(endDate, now) % 60,
        seconds: differenceInSeconds(endDate, now) % 60,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endDateStr]);

  // Jeu terminé (phase serveur ou countdown écoulé)
  const phase = gameConfig?.phase;
  if (isEnded || phase === 'claim_only' || phase === 'ended') {
    return (
      <section className="bg-terracotta-deep py-6">
        <div className="container mx-auto px-6 text-center">
          <p className="font-display text-lg font-semibold text-white">
            Le jeu-concours est termine ! Vous avez 30 jours pour recuperer vos lots.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-y border-warm-beige bg-white py-6">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        <p className="font-functional text-ui uppercase tracking-[2px] text-stone-grey">
          Temps restant pour participer
        </p>

        <div className="flex items-center gap-3">
          {/* Avant que la config arrive, les valeurs sont à 0 — flash imperceptible */}
          <TimeBlock value={timeLeft.days}    label="Jours" />
          <Separator />
          <TimeBlock value={timeLeft.hours}   label="Heures" />
          <Separator />
          <TimeBlock value={timeLeft.minutes} label="Minutes" />
          <Separator />
          <TimeBlock value={timeLeft.seconds} label="Secondes" />
        </div>

        <Button asChild size="sm" variant="secondary">
          <Link href="/dashboard/participate">Participer maintenant</Link>
        </Button>
      </div>
    </section>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-2xl font-bold text-noir">
        {String(value).padStart(2, '0')}
      </span>
      <span className="font-functional text-[9px] uppercase tracking-[1px] text-stone-grey">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return <span className="text-lg font-bold text-warm-beige">:</span>;
}
