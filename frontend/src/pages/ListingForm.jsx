import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X, Star, Loader2 } from 'lucide-react';
import api, { apiError } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const selectClass =
  'h-11 w-full border-2 border-ink rounded-[6px] bg-white px-2 font-sans text-ink shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-info';
const labelClass = 'mb-1 block text-sm font-bold';

export default function ListingForm() {
  const { id } = useParams(); // present => edit mode
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [topCat, setTopCat] = useState('');
  const [subCat, setSubCat] = useState('');
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    isFree: false,
    negotiable: false,
    condition: 'Good',
    location: user?.location || '',
    quantity: 1,
    tags: '',
  });

  const [loading, setLoading] = useState(isEdit);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  // Edit mode: load the listing and prefill.
  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/listings/${id}`)
      .then(({ data }) => {
        const l = data.listing;
        if (user && String(l.seller?._id) !== String(user._id)) {
          navigate(`/listings/${id}`); // not the owner
          return;
        }
        setForm({
          title: l.title,
          description: l.description,
          price: l.isFree ? '' : String(l.price),
          isFree: l.isFree,
          negotiable: l.negotiable,
          condition: l.condition,
          location: l.location,
          quantity: l.quantity,
          tags: (l.tags || []).join(', '),
        });
        setImages(l.images || []);
        setSubCat(l.category?._id || '');
        setTopCat(l.category?.parent?._id || '');
      })
      .catch(() => setError('Could not load listing'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const subcategories = categories.find((c) => c._id === topCat)?.subcategories || [];

  async function onFiles(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const room = 5 - images.length;
    if (room <= 0) {
      setError('You can upload at most 5 images.');
      e.target.value = '';
      return;
    }
    const fd = new FormData();
    files.slice(0, room).forEach((f) => fd.append('images', f));
    setUploading(true);
    setError('');
    try {
      const { data } = await api.post('/uploads', fd);
      setImages((prev) => [...prev, ...data.urls].slice(0, 5));
    } catch (err) {
      setError(apiError(err, 'Image upload failed'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));
  const makeCover = (i) =>
    setImages((prev) => {
      const next = [...prev];
      const [picked] = next.splice(i, 1);
      return [picked, ...next];
    });

  function validate() {
    if (!form.title.trim()) return 'Title is required';
    if (!form.description.trim()) return 'Description is required';
    if (!subCat) return 'Please choose a subcategory';
    if (!form.location.trim()) return 'Location is required';
    if (!form.isFree && (form.price === '' || Number(form.price) < 0)) return 'Enter a valid price (or mark it Free)';
    if (images.length < 1) return 'Add at least one image';
    return '';
  }

  async function onSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    setError('');
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      isFree: form.isFree,
      negotiable: form.negotiable,
      category: subCat,
      condition: form.condition,
      location: form.location.trim(),
      quantity: Number(form.quantity) || 1,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      images,
    };
    if (!form.isFree) payload.price = Number(form.price);
    else payload.price = 0;

    try {
      if (isEdit) {
        await api.patch(`/listings/${id}`, payload);
        navigate(`/listings/${id}`);
      } else {
        const { data } = await api.post('/listings', payload);
        navigate(`/listings/${data.listing._id}`);
      }
    } catch (err) {
      setError(apiError(err, 'Could not save listing'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="px-4 py-16 text-center font-heading">Loading…</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-5 text-3xl">{isEdit ? 'Edit listing' : 'Sell an item'}</h1>
      <Card className="p-6">
        {error && (
          <div className="mb-4 rounded-[6px] border-2 border-ink bg-danger/20 px-3 py-2 text-sm font-bold">{error}</div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Images */}
          <div>
            <label className={labelClass}>Photos (up to 5, first is the cover)</label>
            <div className="flex flex-wrap gap-3">
              {images.map((url, i) => (
                <div key={url} className="relative h-24 w-24 overflow-hidden rounded-[8px] border-2 border-ink shadow-neo-sm">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute left-0 top-0 bg-primary px-1 text-[10px] font-bold border-r-2 border-b-2 border-ink">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    aria-label="Remove"
                    className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center border-l-2 border-b-2 border-ink bg-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => makeCover(i)}
                      aria-label="Make cover"
                      className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1 border-t-2 border-ink bg-white py-0.5 text-[10px] font-bold"
                    >
                      <Star className="h-3 w-3" /> Cover
                    </button>
                  )}
                </div>
              ))}
              {images.length < 5 && (
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-[8px] border-2 border-dashed border-ink bg-white text-xs font-bold text-ink/60 hover:bg-muted">
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                  {uploading ? 'Uploading' : 'Add'}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} disabled={uploading} />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>Title</label>
            <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. iPhone 12 (128GB)" />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={4}
              placeholder="Condition, reason for selling, what's included…"
              className="w-full rounded-[6px] border-2 border-ink bg-white px-3 py-2 shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-info"
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Category</label>
              <select
                className={selectClass}
                value={topCat}
                onChange={(e) => {
                  setTopCat(e.target.value);
                  setSubCat('');
                }}
              >
                <option value="">Choose…</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Subcategory</label>
              <select className={selectClass} value={subCat} onChange={(e) => setSubCat(e.target.value)} disabled={!topCat}>
                <option value="">Choose…</option>
                {subcategories.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Price (₹)</label>
              <Input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                disabled={form.isFree}
                placeholder={form.isFree ? 'Free' : '0'}
              />
            </div>
            <div className="flex items-end gap-4 pb-1">
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" checked={form.isFree} onChange={(e) => set('isFree', e.target.checked)} className="h-4 w-4 accent-ink" />
                Free
              </label>
              <label className="flex items-center gap-2 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={form.negotiable}
                  onChange={(e) => set('negotiable', e.target.checked)}
                  className="h-4 w-4 accent-ink"
                  disabled={form.isFree}
                />
                Negotiable
              </label>
            </div>
          </div>

          {/* Condition / quantity */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Condition</label>
              <select className={selectClass} value={form.condition} onChange={(e) => set('condition', e.target.value)}>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Quantity</label>
              <Input type="number" min="1" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Location</label>
            <Input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="City" />
          </div>

          <div>
            <label className={labelClass}>
              Tags <span className="font-normal text-ink/50">(comma-separated)</span>
            </label>
            <Input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="e.g. apple, smartphone" />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting || uploading}>
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Publish listing'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
