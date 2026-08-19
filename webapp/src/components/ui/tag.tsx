import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// DESIGN.md - Tags (pill) : fond teinté, sans bordure, coins pill.
//
// Le motif d'origine « texte de la même couleur que son fond translucide » est
// structurellement incompatible avec le critère 1.4.3 : un texte posé sur une
// teinte de lui-même plafonnait entre 1.39 et 3.79 pour toutes les variantes
// sauf neutral, là où le niveau AA exige 4.5 sur du petit texte — et ces tags
// sont en 10 px.
//
// Aucune nuance sombre de la même teinte ne s'en sortait : la palette n'en
// possède pas pour le vert mousse. Le fond teinté est donc conservé — c'est lui
// qui porte le code couleur — et le texte passe au gris pierre, conforme sur
// toutes les variantes, de 5.23 pour bio à 9.07 pour season.
//
// Hex explicites pour garantir la génération JIT (évite les problèmes avec les clés imbriquées)
const tagVariants = cva(
  'inline-flex items-center gap-2 rounded-pill px-[10px] py-1 font-functional text-[10px] font-semibold uppercase tracking-[2px] text-[#4A463E]',
  {
    variants: {
      variant: {
        // #5C6B3A - Vert mousse
        bio:          'bg-[#5C6B3A]/40',  // 40%
        detox:        'bg-[#5C6B3A]/30',  // 30%
        // #BA6905 - Terracotta profond
        handmade:     'bg-[#BA6905]/40',
        new:          'bg-[#BA6905]/40',   // alias
        // #C76C3A - Terracotta chaud (Méditerranéen)
        mediteraneen: 'bg-[#C76C3A]/40',
        // #C9A96E - Or discret
        premium:      'bg-[#C9A96E]/30',
        // #4A463E - Gris pierre assombri, aligne sur le token stone.
        neutral:      'bg-[#4A463E]/30',
        // #E8D5B0 - Beige chaud (très discret)
        season:       'bg-[#E8D5B0]/10',
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
