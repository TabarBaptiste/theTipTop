import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// DESIGN.md - Badges : fond = couleur du texte/bordure à 40% opacité, bordure unie, rounded-soft (4px)
// Hex explicites pour garantir la génération JIT (les clés imbriquées ex: gold-500 ne supportent pas /opacity sans DEFAULT)
// Comme pour les tags, le texte ne reprend plus la teinte de son propre fond :
// ce motif plafonnait à 2.24:1 pour l'or et 4.11:1 pour le terracotta, sous le
// seuil AA de 4.5 exigé sur ces 12 px. Fond et bordure teintés sont conservés,
// seul le texte passe au gris pierre.
const badgeVariants = cva(
  'inline-flex items-center gap-[12px] rounded-soft border-[1.5px] px-md py-[10px] font-functional text-[12px] font-semibold uppercase tracking-[1.5px] text-[#4A463E]',
  {
    variants: {
      variant: {
        // #5C6B3A - Vert mousse
        bio:       'border-[#5C6B3A] bg-[#5C6B3A]/40',
        // #BA6905 - Terracotta profond
        handmade:  'border-[#BA6905] bg-[#BA6905]/40',
        // #C9A96E - Or discret
        location:  'border-[#C9A96E] bg-[#C9A96E]/40',
        // #C76C3A - Terracotta chaud (Méditerranéen / Origine)
        certified: 'border-[#C76C3A] bg-[#C76C3A]/40',
      },
    },
    defaultVariants: {
      variant: 'certified',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}

export { Badge, badgeVariants };
