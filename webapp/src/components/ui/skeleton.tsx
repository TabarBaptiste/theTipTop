import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-soft bg-warm-beige/50', className)}
      {...props}
    />
  );
}

// Placeholder pour une liste en cours de chargement : n blocs de meme hauteur.
function SkeletonList({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={cn('h-20 w-full', className)} />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonList };
