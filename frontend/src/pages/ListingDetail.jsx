import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, MapPin, Trash2, Pencil, CheckCircle, RotateCcw, MessageSquare, Send } from 'lucide-react';
import api, { apiError } from '../lib/api';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar } from '../components/ui/avatar';
import { formatPrice, memberSince } from '../lib/format';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthed } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const toast = useToast();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [active, setActive] = useState(0);

  const [composing, setComposing] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState(null); // conversation id once sent
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api
      .get(`/listings/${id}`)
      .then(({ data }) => {
        setListing(data.listing);
        setActive(0);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="px-4 py-16 text-center font-heading">Loading…</div>;
  }
  if (notFound || !listing) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-[10px] border-2 border-ink bg-white p-8 shadow-neo">
          <h1 className="mb-2 text-2xl">Listing not found</h1>
          <p className="mb-4 text-ink/60">It may have been removed or sold.</p>
          <Button onClick={() => navigate('/')}>Back to browse</Button>
        </div>
      </div>
    );
  }

  const seller = listing.seller;
  const isOwner = user && seller && String(seller._id) === String(user._id);
  const sold = listing.status === 'sold';
  const fav = isFavorite(listing._id);
  const cat = listing.category;

  async function handleDelete() {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    try {
      await api.delete(`/listings/${listing._id}`);
      toast.success('Listing deleted');
      navigate('/dashboard');
    } catch (err) {
      setError(apiError(err, 'Could not delete listing'));
    }
  }

  async function toggleSold() {
    try {
      const { data } = await api.patch(`/listings/${listing._id}/sold`);
      setListing((l) => ({ ...l, status: data.listing.status }));
      toast.success(data.listing.status === 'sold' ? 'Marked as sold' : 'Relisted as active');
    } catch (err) {
      setError(apiError(err, 'Could not update status'));
    }
  }

  async function sendMessage() {
    if (!message.trim()) return;
    setSending(true);
    setError('');
    try {
      const { data } = await api.post('/conversations', { listingId: listing._id, body: message.trim() });
      setSentTo(data.conversation._id);
    } catch (err) {
      setError(apiError(err, 'Could not send message'));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-ink/60">
        <Link to="/" className="hover:underline">
          Browse
        </Link>
        {cat?.parent?.name && <> {' › '} {cat.parent.name}</>}
        {cat?.name && <> {' › '} <span className="font-bold text-ink">{cat.name}</span></>}
      </nav>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative overflow-hidden rounded-[10px] border-2 border-ink shadow-neo">
            <img
              src={listing.images[active]}
              alt={listing.title}
              className={cn('h-80 w-full object-cover', sold && 'opacity-60 grayscale')}
            />
            {sold && (
              <span className="absolute left-3 top-3">
                <Badge variant="sold">SOLD</Badge>
              </span>
            )}
          </div>
          {listing.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {listing.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActive(i)}
                  className={cn(
                    'h-16 w-16 overflow-hidden rounded-[6px] border-2',
                    i === active ? 'border-ink shadow-neo-sm' : 'border-ink/30'
                  )}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-3xl">{listing.title}</h1>
            {isAuthed && !isOwner && (
              <button
                type="button"
                aria-label="Toggle favorite"
                onClick={() => toggle(listing._id)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white shadow-neo-sm active:translate-y-[1px]"
              >
                <Heart className={cn('h-5 w-5', fav && 'fill-pink text-pink')} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={listing.isFree ? 'free' : 'default'} className="text-sm">
              {formatPrice(listing.price, listing.isFree)}
            </Badge>
            {listing.negotiable && !listing.isFree && <Badge variant="neutral">Negotiable</Badge>}
            <Badge variant="neutral">{listing.condition}</Badge>
            {listing.quantity > 1 && <Badge variant="neutral">Qty: {listing.quantity}</Badge>}
          </div>

          <p className="flex items-center gap-1 text-sm text-ink/70">
            <MapPin className="h-4 w-4" /> {listing.location}
          </p>

          {listing.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {listing.tags.map((t) => (
                <span key={t} className="rounded-full border-2 border-ink/30 px-2 py-0.5 text-xs text-ink/60">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-[6px] border-2 border-ink bg-danger/20 px-3 py-2 text-sm font-bold">{error}</div>
          )}

          {/* Owner actions vs buyer actions */}
          {isOwner ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate(`/listings/${listing._id}/edit`)}>
                <Pencil className="h-4 w-4" /> Edit
              </Button>
              <Button variant={sold ? 'secondary' : 'info'} onClick={toggleSold}>
                {sold ? <RotateCcw className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                {sold ? 'Mark active' : 'Mark sold'}
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          ) : sentTo ? (
            <div className="rounded-[6px] border-2 border-ink bg-success/30 px-3 py-3 text-sm font-bold">
              Message sent!{' '}
              <Link to="/messages" className="underline">
                Go to your inbox
              </Link>
            </div>
          ) : composing ? (
            <div className="space-y-2">
              <textarea
                autoFocus
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder={`Message ${seller?.name?.split(' ')[0] || 'the seller'}…`}
                className="w-full rounded-[6px] border-2 border-ink bg-white px-3 py-2 shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-info"
              />
              <div className="flex gap-2">
                <Button onClick={sendMessage} disabled={sending || !message.trim()}>
                  <Send className="h-4 w-4" /> {sending ? 'Sending…' : 'Send'}
                </Button>
                <Button variant="ghost" onClick={() => setComposing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => (isAuthed ? setComposing(true) : navigate('/login', { state: { from: { pathname: `/listings/${listing._id}` } } }))}
            >
              <MessageSquare className="h-4 w-4" /> Message seller
            </Button>
          )}

          {/* Seller card */}
          {seller && (
            <Link
              to={`/u/${seller._id}`}
              className="flex items-center gap-3 rounded-[10px] border-2 border-ink bg-white p-3 shadow-neo-sm transition-all hover:-translate-y-[2px] hover:shadow-neo"
            >
              <Avatar name={seller.name} />
              <div>
                <p className="font-heading font-bold leading-tight">{seller.name}</p>
                <p className="text-xs text-ink/60">
                  {seller.location} · Member since {memberSince(seller.createdAt)}
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mt-6 rounded-[10px] border-2 border-ink bg-white p-5 shadow-neo">
        <h2 className="mb-2 text-xl">Description</h2>
        <p className="whitespace-pre-wrap text-ink/80">{listing.description}</p>
      </div>
    </div>
  );
}
