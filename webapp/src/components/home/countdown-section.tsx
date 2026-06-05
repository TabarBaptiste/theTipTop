'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { Button } from '@/components/ui/button';

const GAME_END_DATE = new Date(process.env.NEXT_PUBLIC_GAME_END_DATE || '2026-09-30T23:59:59.999Z');

export function CountdownSection() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();

      if (now >= GAME_END_DATE) {
        setIsEnded(true);
        return;
      }

      const days = differenceInDays(GAME_END_DATE, now);
      const hours = differenceInHours(GAME_END_DATE, now) % 24;
      const minutes = differenceInMinutes(GAME_END_DATE, now) % 60;
      const seconds = differenceInSeconds(GAME_END_DATE, now) % 60;

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  if (isEnded) {
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
          <TimeBlock value={timeLeft.days} label="Jours" />
          <Separator />
          <TimeBlock value={timeLeft.hours} label="Heures" />
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
