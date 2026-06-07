import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Input = forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-11 w-full border-2 border-ink rounded-[6px] bg-white px-3 font-sans text-ink shadow-neo-sm placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-info',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';
