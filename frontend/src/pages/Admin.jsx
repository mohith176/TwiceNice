import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Ban, ShieldCheck } from 'lucide-react';
import api, { apiError } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { formatPrice } from '../lib/format';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Admin() {
  const [tab, setTab] = useState('categories');
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-5 text-3xl">Admin</h1>
      <div className="mb-5 flex flex-wrap gap-2">
        <TabButton active={tab === 'categories'} onClick={() => setTab('categories')} label="Categories" />
        <TabButton active={tab === 'listings'} onClick={() => setTab('listings')} label="Listings" />
        <TabButton active={tab === 'users'} onClick={() => setTab('users')} label="Users" />
      </div>
      {tab === 'categories' && <CategoriesPanel />}
      {tab === 'listings' && <ListingsPanel />}
      {tab === 'users' && <UsersPanel />}
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

function ErrorBanner({ error }) {
  if (!error) return null;
  return <div className="mb-4 rounded-[6px] border-2 border-ink bg-danger/20 px-3 py-2 text-sm font-bold">{error}</div>;
}

/* ---------------- Categories ---------------- */
function CategoriesPanel() {
  const [cats, setCats] = useState([]);
  const [newTop, setNewTop] = useState('');
  const [subInputs, setSubInputs] = useState({});
  const [error, setError] = useState('');

  const load = () => api.get('/categories').then(({ data }) => setCats(data.categories)).catch(() => {});
  useEffect(() => {
    load();
  }, []);

  async function run(fn) {
    setError('');
    try {
      await fn();
      load();
    } catch (e) {
      setError(apiError(e));
    }
  }

  const addTop = () => newTop.trim() && run(async () => {
    await api.post('/categories', { name: newTop.trim() });
    setNewTop('');
  });
  const addSub = (parentId) => {
    const name = (subInputs[parentId] || '').trim();
    if (!name) return;
    run(async () => {
      await api.post('/categories', { name, parent: parentId });
      setSubInputs((s) => ({ ...s, [parentId]: '' }));
    });
  };
  const rename = (cat) => {
    const name = window.prompt('Rename category', cat.name);
    if (name && name.trim()) run(() => api.patch(`/categories/${cat._id}`, { name: name.trim() }));
  };
  const del = (cat) => {
    if (window.confirm(`Delete "${cat.name}"?`)) run(() => api.delete(`/categories/${cat._id}`));
  };

  return (
    <div>
      <ErrorBanner error={error} />
      <div className="mb-4 flex gap-2">
        <Input value={newTop} onChange={(e) => setNewTop(e.target.value)} placeholder="New top-level category" onKeyDown={(e) => e.key === 'Enter' && addTop()} />
        <Button onClick={addTop}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <div className="space-y-4">
        {cats.map((c) => (
          <div key={c._id} className="rounded-[10px] border-2 border-ink bg-white p-4 shadow-neo-sm">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="font-heading text-lg font-bold">{c.name}</span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => rename(c)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => del(c)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {c.subcategories?.map((s) => (
                <span key={s._id} className="flex items-center gap-1 rounded-full border-2 border-ink bg-muted px-2 py-0.5 text-sm">
                  {s.name}
                  <button onClick={() => rename(s)} aria-label="Rename" className="text-ink/60 hover:text-ink">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button onClick={() => del(s)} aria-label="Delete" className="text-danger">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                value={subInputs[c._id] || ''}
                onChange={(e) => setSubInputs((s) => ({ ...s, [c._id]: e.target.value }))}
                placeholder={`Add subcategory to ${c.name}`}
                onKeyDown={(e) => e.key === 'Enter' && addSub(c._id)}
                className="h-9"
              />
              <Button size="sm" variant="outline" onClick={() => addSub(c._id)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Listings ---------------- */
function ListingsPanel() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/listings').then(({ data }) => setRows(data.listings)).catch((e) => setError(apiError(e))).finally(() => setLoading(false));
  }, []);

  async function remove(l) {
    if (!window.confirm(`Remove "${l.title}"? This deletes another user's listing.`)) return;
    setError('');
    try {
      await api.delete(`/admin/listings/${l._id}`);
      setRows((r) => r.filter((x) => x._id !== l._id));
      toast.success('Listing removed');
    } catch (e) {
      toast.error(apiError(e));
    }
  }

  if (loading) return <div className="py-12 text-center font-heading">Loading…</div>;

  return (
    <div>
      <ErrorBanner error={error} />
      <div className="space-y-2">
        {rows.map((l) => (
          <div key={l._id} className="flex flex-wrap items-center gap-3 rounded-[10px] border-2 border-ink bg-white p-3 shadow-neo-sm">
            <img src={l.images?.[0]} alt="" className="h-12 w-12 rounded-[6px] border-2 border-ink object-cover" />
            <div className="min-w-0 flex-1">
              <Link to={`/listings/${l._id}`} className="block truncate font-heading font-bold hover:underline">
                {l.title}
              </Link>
              <p className="truncate text-xs text-ink/60">
                {l.seller?.name} ({l.seller?.email}) · {l.category?.name} · {formatPrice(l.price, l.isFree)}
              </p>
            </div>
            {l.status === 'sold' && <Badge variant="sold">SOLD</Badge>}
            <Button size="sm" variant="destructive" onClick={() => remove(l)}>
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Users ---------------- */
function UsersPanel() {
  const { user } = useAuth();
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/users').then(({ data }) => setRows(data.users)).catch((e) => setError(apiError(e))).finally(() => setLoading(false));
  }, []);

  async function toggleBan(u) {
    setError('');
    try {
      const { data } = await api.patch(`/admin/users/${u._id}/ban`);
      setRows((r) => r.map((x) => (x._id === u._id ? data.user : x)));
      toast.success(data.user.isBanned ? `${data.user.name} banned` : `${data.user.name} unbanned`);
    } catch (e) {
      toast.error(apiError(e));
    }
  }

  if (loading) return <div className="py-12 text-center font-heading">Loading…</div>;

  return (
    <div>
      <ErrorBanner error={error} />
      <div className="space-y-2">
        {rows.map((u) => (
          <div key={u._id} className="flex flex-wrap items-center gap-3 rounded-[10px] border-2 border-ink bg-white p-3 shadow-neo-sm">
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading font-bold">
                {u.name}{' '}
                {u.isAdmin && <Badge variant="info" className="ml-1">Admin</Badge>}
                {u.isBanned && <Badge variant="sold" className="ml-1">Banned</Badge>}
              </p>
              <p className="truncate text-xs text-ink/60">
                {u.email} · {u.location}
              </p>
            </div>
            {u._id === user._id ? (
              <span className="text-xs font-bold text-ink/40">You</span>
            ) : (
              <Button size="sm" variant={u.isBanned ? 'info' : 'destructive'} onClick={() => toggleBan(u)}>
                {u.isBanned ? <ShieldCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                {u.isBanned ? 'Unban' : 'Ban'}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
