'use client';

import { useEffect, useState } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

// Date de fin du jeu (à configurer)
const GAME_END_DATE = new Date(process.env.NEXT_PUBLIC_GAME_END_DATE || '2025-01-30T23:59:59.999Z');

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
      <section className="bg-gold-500 py-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white">
            Le jeu-concours est terminé !
          </h2>
          <p className="mt-2 text-gold-100">
            Vous avez jusqu&apos;au 1er mars 2025 pour récupérer vos lots.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-r from-tea-600 to-tea-700 py-8">
      <div className="container mx-auto px-4 text-center">
        <h2 className="mb-6 text-xl font-semibold text-white md:text-2xl">
          Temps restant pour participer
        </h2>
        
        <div className="flex justify-center gap-4 md:gap-8">
          <TimeBlock value={timeLeft.days} label="Jours" />
          <TimeBlock value={timeLeft.hours} label="Heures" />
          <TimeBlock value={timeLeft.minutes} label="Minutes" />
          <TimeBlock value={timeLeft.seconds} label="Secondes" />
        </div>
      </div>
    </section>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white text-2xl font-bold text-tea-600 shadow-lg md:h-20 md:w-20 md:text-3xl">
        {String(value).padStart(2, '0')}
      </div>
      <span className="mt-2 text-xs text-tea-100 md:text-sm">{label}</span>
    </div>
  );
}
