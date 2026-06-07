import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 border-2 border-ink rounded-full px-2.5 py-0.5 text-xs font-bold font-heading',
  {
    variants: {
      variant: {
        default: 'bg-primary text-ink',
        sold: 'bg-danger text-white',
        free: 'bg-success text-ink',
        info: 'bg-info text-white',
        neutral: 'bg-white text-ink',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
