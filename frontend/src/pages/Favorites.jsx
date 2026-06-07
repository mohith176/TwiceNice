import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import api from '../lib/api';
import { ListingCard } from '../components/ListingCard';
import { useFavorites } from '../context/FavoritesContext';

export default function Favorites() {
  const { isFavorite } = useFavorites();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/favorites')
      .then(({ data }) => setItems(data.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  // Filter by the live favorites set so un-hearting a card removes it immediately.
  const shown = items.filter((l) => isFavorite(l._id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-5 flex items-center gap-2 text-3xl">
        <Heart className="h-7 w-7 fill-pink text-pink" /> Favorites
      </h1>

      {loading ? (
        <div className="py-12 text-center font-heading">Loading…</div>
      ) : shown.length === 0 ? (
        <div className="rounded-[10px] border-2 border-ink bg-white p-10 text-center shadow-neo">
          <p className="font-heading text-lg font-bold">No saved listings yet</p>
          <p className="mt-1 text-ink/60">
            Tap the heart on any listing to save it here.{' '}
            <Link to="/" className="font-bold underline">
              Browse listings
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((l) => (
            <ListingCard key={l._id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
