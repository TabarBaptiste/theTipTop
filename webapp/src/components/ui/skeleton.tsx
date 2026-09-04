import { useId } from 'react';
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
  // Prefixe unique par instance, fourni par React et identique entre le rendu
  // serveur et le rendu client. Math.random() y tirait deux valeurs distinctes
  // - donc une divergence d'hydratation - et enfreignait la regle de purete du
  // rendu (react-hooks/purity). Le rang complete le prefixe : les blocs sont
  // interchangeables et jamais reordonnes, seule leur position les distingue.
  const prefixe = useId();
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, rang) => (
        <Skeleton key={`${prefixe}bloc${rang}`} className={cn('h-20 w-full', className)} />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonList };
