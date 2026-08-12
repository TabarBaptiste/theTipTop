import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'line' | 'circle' | 'card' | 'text';
}

export function Skeleton({ className, variant = 'line', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-soft bg-gradient-to-r from-warm-beige via-white to-warm-beige',
        variant === 'circle' && 'rounded-full',
        variant === 'card' && 'rounded-card',
        variant === 'text' && 'h-4 w-full',
        className,
      )}
      style={{
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s infinite',
      }}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="space-y-4 rounded-card border border-warm-beige bg-white p-6">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-11 w-full" />
    </div>
  );
}

export function SkeletonFullPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 bg-cream px-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
  );
}
