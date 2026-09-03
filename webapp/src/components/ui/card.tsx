import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-card border border-warm-beige bg-terracotta-pale/30 text-foreground',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'font-display text-h3 font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-stone-grey', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// --- PrizeCard - lots à gagner ---

type PrizeCategory = 'signature' | 'accessoire' | 'grandprix';

const CATEGORY_LABELS: Record<PrizeCategory, string> = {
  signature: 'Thé Signature',
  accessoire: 'Accessoire',
  grandprix: 'Grand Prix',
};

interface PrizeCardProps {
  /** URL string ou StaticImageData Next.js ({ src: string }) */
  image?: string | { src: string };
  imageAlt?: string;
  category: PrizeCategory;
  title: string;
  value: string | null;  // ex: "39€" ou null si pas de valeur associée
  odds: string;   // ex: "1 chance sur 3" ou "33%"
  className?: string;
}

function PrizeCard({ image, imageAlt = '', category, title, value, odds, className }: PrizeCardProps) {
  const imgSrc = typeof image === 'string' ? image : image?.src;

  return (
    // Le lot etait pose a nu sur le fond de page : rien ne le designait comme
    // un objet a part, et l'image partageait la vedette avec le texte. Sur une
    // surface qui se detache, l'image occupe la plus grande part de la carte
    // et le texte passe en legende.
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-card bg-cream',
        'shadow-[0_18px_40px_-26px_rgba(26,26,26,0.5)]',
        'transition-[transform,box-shadow] duration-300 ease-out',
        'hover:-translate-y-1 hover:shadow-[0_26px_52px_-24px_rgba(26,26,26,0.55)]',
        'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        className
      )}
    >
      {/* Portrait plutot que paysage : a largeur de colonne egale, le format
          vertical donne au visuel la moitie de la hauteur de la carte. */}
      <div className="aspect-[4/5] w-full overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={imageAlt}
            className="block h-full w-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-terracotta-50 to-warm-beige/50" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-md">
        {/* Catégorie : label terracotta UPPERCASE, sans background */}
        <p className="font-functional text-ui uppercase text-accent">
          {CATEGORY_LABELS[category]}
        </p>

        {/* Titre éditorial italique */}
        <h3 className="mt-2xs font-editorial text-h3 italic text-ink">{title}</h3>

        {/* Footer : valeur (gauche) + pourcentage (droite), séparés par un filet.
            « mt-auto » le colle en bas quelle que soit la longueur du titre, pour
            que les filets s'alignent d'une carte à l'autre. */}
        <div
          className={cn(
            'mt-auto flex items-center border-t border-warm-beige pt-sm',
            value ? 'justify-between' : 'justify-end'
          )}
        >
          {value && <span className="font-functional text-caption text-stone">Valeur {value}</span>}
          <span className="font-functional text-caption font-semibold text-accent">{odds}</span>
        </div>
      </div>
    </article>
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, PrizeCard };
export type { PrizeCardProps, PrizeCategory };
