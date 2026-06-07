import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Neobrutalist button: thick black border + hard offset shadow. Hovering lifts it
// (shadow grows), pressing pushes it down into the shadow.
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 border-2 border-ink rounded-[6px] font-heading font-bold transition-all duration-100 shadow-neo hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-neo-lg active:translate-x-0 active:translate-y-0 active:shadow-neo-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-ink',
        secondary: 'bg-pink text-white',
        info: 'bg-info text-white',
        outline: 'bg-white text-ink',
        destructive: 'bg-danger text-white',
        ghost:
          'border-transparent shadow-none bg-transparent hover:translate-x-0 hover:translate-y-0 hover:shadow-none hover:bg-muted active:shadow-none',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        default: 'h-11 px-5 text-base',
        lg: 'h-12 px-7 text-lg',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export function Button({ className, variant, size, ...props }) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
