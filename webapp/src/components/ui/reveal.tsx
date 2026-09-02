'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: React.ReactNode;
  /** Decalage en millisecondes, pour echelonner plusieurs elements voisins. */
  delay?: number;
  className?: string;
}

/**
 * Fait apparaitre son contenu quand il entre dans l'ecran, une seule fois.
 *
 * L'etat masque n'est pose que sous `motion-safe` : qui a demande moins de
 * mouvement voit le contenu tout de suite, sans transition ni saut.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Sans IntersectionObserver - jsdom, navigateur ancien - on affiche au
    // tick suivant : une animation indisponible ne doit jamais masquer la
    // page. Le report evite d'appeler setState pendant l'effet lui-meme, et
    // de calculer l'etat initial differemment sur le serveur et le client -
    // ce qui provoquerait une divergence d'hydratation.
    if (typeof IntersectionObserver === 'undefined') {
      const report = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(report);
    }

    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (!entree.isIntersecting) return;
        setVisible(true);
        // Une seule fois : reanimer a chaque passage donnerait le mal de mer
        // sur un aller-retour de defilement.
        observateur.disconnect();
      },
      // La section doit etre franchement entree avant de s'animer, sinon elle
      // se declenche alors qu'elle affleure a peine le bas de l'ecran.
      { rootMargin: '0px 0px -12% 0px' }
    );

    observateur.observe(element);
    return () => observateur.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-out',
        visible ? 'opacity-100' : 'motion-safe:translate-y-6 motion-safe:opacity-0',
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
