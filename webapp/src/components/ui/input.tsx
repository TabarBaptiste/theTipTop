import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // gold-700 et non warm-beige : le beige ne donnait que 1.44:1 sur
          // blanc, la ou WCAG 1.4.11 exige 3:1 pour la delimitation d'un champ.
          // C'est la nuance la plus claire de la palette chaude qui franchisse
          // le seuil - gold-600 plafonne a 2.83:1.
          'flex h-10 w-full rounded-soft border-[1.5px] border-gold-700 bg-white px-4 py-3 font-functional text-body text-noir placeholder:text-stone-grey transition-colors duration-200 focus:outline-none focus:border-terracotta-600 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
