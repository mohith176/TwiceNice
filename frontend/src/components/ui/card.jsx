import { cn } from '../../lib/utils';

export function Card({ className, ...props }) {
  return <div className={cn('border-2 border-ink rounded-[10px] bg-white shadow-neo', className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('p-4 border-b-2 border-ink', className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn('font-heading font-bold text-lg leading-tight', className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-4', className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return <div className={cn('p-4 border-t-2 border-ink flex items-center', className)} {...props} />;
}
