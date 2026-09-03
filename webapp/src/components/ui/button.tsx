import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-functional font-bold tracking-[2px] uppercase transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-terracotta-600 text-white rounded-full hover:bg-terracotta-700',
        destructive:
          'bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90',
        outline:
          'border-[1.5px] border-accent text-accent bg-transparent rounded-full hover:bg-terracotta-600 hover:text-white',
        secondary:
          'bg-moss text-white rounded-full hover:bg-moss-light',
        ghost:
          'hover:bg-terracotta-50 hover:text-accent rounded-soft normal-case tracking-normal font-semibold',
        link:
          'text-accent underline-offset-4 hover:underline normal-case tracking-normal font-semibold',
      },
      // Les libellés restaient à 11 px quelle que soit la taille : un « lg » ne
      // se distinguait d'un « default » que par 8 px de hauteur, trop peu pour
      // hiérarchiser deux actions côte à côte. La taille du texte varie
      // désormais avec celle du bouton, ce qui creuse l'écart.
      size: {
        // 44 px : la cible tactile recommandée, que les 40 px précédents
        // n'atteignaient pas.
        default: 'h-11 px-8 py-3 text-ui',
        sm: 'h-9 px-6 py-2 text-ui',
        lg: 'h-14 px-10 py-3 text-[13px]',
        // En-tete : 28 px de haut, libelle a 10 px sur la maquette. Meme
        // reserve tactile en dessous de md.
        nav: 'h-9 md:h-7 px-5 text-[10px]',
        // Réservé à l'action principale d'un écran : une seule par vue.
        // Le libellé ne se coupe pas (whitespace-nowrap) : sur les écrans
        // étroits, c'est la marge intérieure qui cède.
        xl: 'h-16 px-8 sm:px-12 py-4 text-[15px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
