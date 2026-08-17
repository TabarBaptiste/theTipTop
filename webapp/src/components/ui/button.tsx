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
          'bg-terracotta-deep text-white rounded-full hover:bg-terracotta-hover',
        destructive:
          'bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90',
        outline:
          'border-[1.5px] border-terracotta-deep text-terracotta-deep bg-transparent rounded-full hover:bg-terracotta-deep hover:text-white',
        secondary:
          'bg-moss text-white rounded-full hover:bg-moss-light',
        ghost:
          'hover:bg-terracotta-50 hover:text-terracotta-deep rounded-soft normal-case tracking-normal font-semibold',
        link:
          'text-terracotta-deep underline-offset-4 hover:underline normal-case tracking-normal font-semibold',
      },
      size: {
        default: 'h-10 px-8 py-3 text-ui',
        sm: 'h-9 px-6 py-2 text-ui',
        lg: 'h-12 px-10 py-3 text-ui',
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
