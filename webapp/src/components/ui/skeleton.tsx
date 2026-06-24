import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-soft bg-warm-beige/50', className)}
      {...props}
    />
  );
}

export { Skeleton };
