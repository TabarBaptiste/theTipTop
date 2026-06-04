import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// DESIGN.md — Tags (pill) : fond = couleur du texte avec opacité réduite, sans bordure, coins pill
// Hex explicites pour garantir la génération JIT (évite les problèmes avec les clés imbriquées)
const tagVariants = cva(
  'inline-flex items-center gap-2 rounded-pill px-[10px] py-1 font-functional text-[10px] font-semibold uppercase tracking-[2px]',
  {
    variants: {
      variant: {
        // #5C6B3A — Vert mousse
        bio:          'bg-[#5C6B3A]/40 text-[#5C6B3A]',  // 40%
        detox:        'bg-[#5C6B3A]/30 text-[#5C6B3A]',  // 30%
        // #BA6905 — Terracotta profond
        handmade:     'bg-[#BA6905]/40 text-[#BA6905]',
        new:          'bg-[#BA6905]/40 text-[#BA6905]',   // alias
        // #C76C3A — Terracotta chaud (Méditerranéen)
        mediteraneen: 'bg-[#C76C3A]/40 text-[#C76C3A]',
        // #C9A96E — Or discret
        premium:      'bg-[#C9A96E]/30 text-[#C9A96E]',
        // #8A8378 — Gris pierre
        neutral:      'bg-[#8A8378]/30 text-[#8A8378]',
        // #E8D5B0 — Beige chaud (très discret)
        season:       'bg-[#E8D5B0]/10 text-[#E8D5B0]',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
);

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {}

function Tag({ className, variant, ...props }: TagProps) {
  return (
    <span className={cn(tagVariants({ variant, className }))} {...props} />
  );
}

export { Tag, tagVariants };
