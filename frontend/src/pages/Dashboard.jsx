import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, CheckCircle, RotateCcw, Plus, MessageSquare } from 'lucide-react';
import api, { apiError } from '../lib/api';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { formatPrice } from '../lib/format';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/listings/mine')
      .then(({ data }) => setItems(data.items))
      .catch((err) => setError(apiError(err, 'Could not load your listings')))
      .finally(() => setLoading(false));
  }, []);

  const active = items.filter((l) => l.status === 'active');
  const sold = items.filter((l) => l.status === 'sold');
  const shown = tab === 'active' ? active : sold;

  async function toggleSold(item) {
    try {
      const { data } = await api.patch(`/listings/${item._id}/sold`);
      setItems((prev) => prev.map((l) => (l._id === item._id ? { ...l, status: data.listing.status } : l)));
    } catch (err) {
      setError(apiError(err, 'Could not update status'));
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/listings/${item._id}`);
      setItems((prev) => prev.filter((l) => l._id !== item._id));
    } catch (err) {
      setError(apiError(err, 'Could not delete listing'));
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">My listings</h1>
        <div className="flex gap-2">
          <Link to="/messages">
            <Button variant="outline">
              <MessageSquare className="h-4 w-4" /> Inbox
            </Button>
          </Link>
          <Link to="/sell">
            <Button>
              <Plus className="h-4 w-4" /> Sell an item
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2">
        <TabButton active={tab === 'active'} onClick={() => setTab('active')} label={`Active (${active.length})`} />
        <TabButton active={tab === 'sold'} onClick={() => setTab('sold')} label={`Sold (${sold.length})`} />
      </div>

      {error && (
        <div className="mb-4 rounded-[6px] border-2 border-ink bg-danger/20 px-3 py-2 text-sm font-bold">{error}</div>
      )}

      {loading ? (
        <div className="py-12 text-center font-heading">Loading…</div>
      ) : shown.length === 0 ? (
        <div className="rounded-[10px] border-2 border-ink bg-white p-10 text-center shadow-neo">
          <p className="font-heading text-lg font-bold">No {tab} listings</p>
          {tab === 'active' && (
            <p className="mt-1 text-ink/60">
              <Link to="/sell" className="font-bold underline">
                List something
              </Link>{' '}
              to get started.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((item) => (
            <div key={item._id} className="flex flex-wrap items-center gap-3 rounded-[10px] border-2 border-ink bg-white p-3 shadow-neo-sm">
              <Link to={`/listings/${item._id}`} className="shrink-0">
                <img
                  src={item.images?.[0]}
                  alt={item.title}
                  className={cn('h-16 w-16 rounded-[6px] border-2 border-ink object-cover', item.status === 'sold' && 'opacity-60 grayscale')}
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/listings/${item._id}`} className="block truncate font-heading font-bold hover:underline">
                  {item.title}
                </Link>
                <p className="text-sm text-ink/60">
                  {formatPrice(item.price, item.isFree)} · {item.category?.name || '—'}
                </p>
              </div>
              {item.status === 'sold' && <Badge variant="sold">SOLD</Badge>}
              <div className="flex flex-wrap gap-2">
                <Link to={`/listings/${item._id}/edit`}>
                  <Button size="sm" variant="outline">
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                </Link>
                <Button size="sm" variant={item.status === 'sold' ? 'secondary' : 'info'} onClick={() => toggleSold(item)}>
                  {item.status === 'sold' ? <RotateCcw className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  {item.status === 'sold' ? 'Relist' : 'Sold'}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => remove(item)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-[6px] border-2 border-ink px-4 py-2 font-heading font-bold transition-all',
        active ? 'bg-primary shadow-neo-sm' : 'bg-white text-ink/70 hover:bg-muted'
      )}
    >
      {label}
    </button>
  );
}
