import { useMemo } from 'react';
import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: Readonly<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn('animate-pulse rounded-soft bg-warm-beige/50', className)}
      {...props}
    />
  );
}

// Placeholder pour une liste en cours de chargement : n blocs de meme hauteur.
function SkeletonList({ count = 3, className }: Readonly<{ count?: number; className?: string }>) {
  // Identifiants stables et independants de la position, plutot que l'index
  // du tableau (S6479) - sans consequence ici (les blocs sont identiques et
  // jamais reordonnes), mais evite d'y compter en cas d'evolution future.
  // Math.random() plutot que crypto.randomUUID() : ce dernier n'existe pas
  // dans l'environnement jsdom utilise par les tests Jest.
  const ids = useMemo(
    () => Array.from({ length: count }, () => Math.random().toString(36).slice(2)),
    [count],
  );
  return (
    <div className="space-y-3">
      {ids.map((id) => (
        <Skeleton key={id} className={cn('h-20 w-full', className)} />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonList };
