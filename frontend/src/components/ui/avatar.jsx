import { initials } from '../../lib/format';
import { cn } from '../../lib/utils';

const COLORS = ['bg-primary', 'bg-pink text-white', 'bg-info text-white', 'bg-success'];
const SIZES = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-2xl' };

// Auto-generated initials avatar (no uploads), color picked deterministically
// from the name so a given user always gets the same color.
export function Avatar({ name = '', size = 'md', className }) {
  const color = COLORS[(name.charCodeAt(0) || 0) % COLORS.length];
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full border-2 border-ink font-heading font-bold',
        SIZES[size],
        color,
        className
      )}
    >
      {initials(name) || '?'}
    </div>
  );
}
