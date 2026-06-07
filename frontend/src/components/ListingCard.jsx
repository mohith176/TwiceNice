import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { formatPrice } from '../lib/format';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

export function ListingCard({ listing }) {
  const { isAuthed } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(listing._id);
  const sold = listing.status === 'sold';

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-neo-lg">
      <Link to={`/listings/${listing._id}`} className="relative block border-b-2 border-ink">
        <img
          src={listing.images?.[0]}
          alt={listing.title}
          loading="lazy"
          className={cn('h-44 w-full object-cover', sold && 'opacity-60 grayscale')}
        />
        {sold && (
          <span className="absolute left-2 top-2">
            <Badge variant="sold">SOLD</Badge>
          </span>
        )}
        {isAuthed && (
          <button
            type="button"
            aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
            onClick={(e) => {
              e.preventDefault();
              toggle(listing._id);
            }}
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-white shadow-neo-sm transition-transform active:translate-y-[1px]"
          >
            <Heart className={cn('h-4 w-4', fav && 'fill-pink text-pink')} />
          </button>
        )}
      </Link>
      <CardContent className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/listings/${listing._id}`} className="font-heading font-bold leading-tight hover:underline">
            {listing.title}
          </Link>
          <Badge variant={listing.isFree ? 'free' : 'default'} className="shrink-0">
            {formatPrice(listing.price, listing.isFree)}
          </Badge>
        </div>
        <p className="text-sm text-ink/60">
          {listing.condition} · {listing.location}
        </p>
      </CardContent>
    </Card>
  );
}
