import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import api from '../lib/api';
import { Avatar } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { ListingCard } from '../components/ListingCard';
import { memberSince } from '../lib/format';
import { useAuth } from '../context/AuthContext';

export default function PublicProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api
      .get(`/users/${id}`)
      .then(({ data }) => setData(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="px-4 py-16 text-center font-heading">Loading…</div>;
  if (notFound || !data) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-[10px] border-2 border-ink bg-white p-8 shadow-neo">
          <h1 className="mb-2 text-2xl">User not found</h1>
          <Link to="/" className="font-bold underline">
            Back to browse
          </Link>
        </div>
      </div>
    );
  }

  const { user: seller, listings } = data;
  const isOwn = user && String(user._id) === String(seller._id);
  const active = listings.filter((l) => l.status === 'active');
  const sold = listings.filter((l) => l.status === 'sold');

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 rounded-[10px] border-2 border-ink bg-white p-5 shadow-neo">
        <Avatar name={seller.name} size="lg" />
        <div className="min-w-0">
          <h1 className="truncate text-2xl">{seller.name}</h1>
          <p className="flex items-center gap-1 text-sm text-ink/60">
            <MapPin className="h-4 w-4" /> {seller.location} · Member since {memberSince(seller.createdAt)}
          </p>
        </div>
        {isOwn && (
          <Link to="/settings" className="ml-auto shrink-0">
            <Button variant="outline" size="sm">
              Edit profile
            </Button>
          </Link>
        )}
      </div>

      {/* Listings */}
      <section className="mt-8">
        <h2 className="mb-3 text-xl">Active listings ({active.length})</h2>
        {active.length === 0 ? (
          <p className="text-ink/60">No active listings.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((l) => (
              <ListingCard key={l._id} listing={l} />
            ))}
          </div>
        )}
      </section>

      {sold.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-xl">Sold ({sold.length})</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sold.map((l) => (
              <ListingCard key={l._id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
