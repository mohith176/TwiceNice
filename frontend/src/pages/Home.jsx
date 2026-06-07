import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import api from '../lib/api';
import { ListingCard } from '../components/ListingCard';
import { Pagination } from '../components/ui/pagination';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const selectClass =
  'h-11 w-full border-2 border-ink rounded-[6px] bg-white px-2 font-sans text-ink shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-info';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Text-y filters live in local state and apply on button/Enter (no refetch per keystroke).
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [locationInput, setLocationInput] = useState(searchParams.get('location') || '');

  const q = searchParams.get('q') || '';
  const categoryId = searchParams.get('category') || '';
  const subcategoryId = searchParams.get('subcategory') || '';
  const conditions = (searchParams.get('condition') || '').split(',').filter(Boolean);
  const hideSold = searchParams.get('hideSold') === 'true';
  const sort = searchParams.get('sort') || (q ? 'relevance' : 'new');

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  // Refetch whenever any URL param changes — the URL is the single source of truth.
  useEffect(() => {
    setLoading(true);
    const params = Object.fromEntries(searchParams.entries());
    api
      .get('/listings', { params })
      .then(({ data }) => setResult(data))
      .catch(() => setResult({ items: [], total: 0, page: 1, pages: 1 }))
      .finally(() => setLoading(false));
  }, [searchParams]);

  // Keep local inputs in sync if params change externally (e.g. "Clear all").
  useEffect(() => {
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setLocationInput(searchParams.get('location') || '');
  }, [searchParams]);

  function update(mutator) {
    const next = new URLSearchParams(searchParams);
    mutator(next);
    next.delete('page'); // any filter change resets to page 1
    setSearchParams(next);
  }
  const setParam = (key, value) => update((n) => (value ? n.set(key, value) : n.delete(key)));

  function changeCategory(id) {
    update((n) => {
      if (id) n.set('category', id);
      else n.delete('category');
      n.delete('subcategory');
    });
  }

  function toggleCondition(c) {
    const set = new Set(conditions);
    if (set.has(c)) set.delete(c);
    else set.add(c);
    setParam('condition', [...set].join(','));
  }

  function applyPriceLocation() {
    update((n) => {
      minPrice ? n.set('minPrice', minPrice) : n.delete('minPrice');
      maxPrice ? n.set('maxPrice', maxPrice) : n.delete('maxPrice');
      locationInput.trim() ? n.set('location', locationInput.trim()) : n.delete('location');
    });
  }

  function clearAll() {
    const next = new URLSearchParams();
    if (q) next.set('q', q); // keep the active search term
    setSearchParams(next);
  }

  function goToPage(p) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const selectedCategory = useMemo(() => categories.find((c) => c._id === categoryId), [categories, categoryId]);
  const subcategories = selectedCategory?.subcategories || [];
  const hasFilters =
    categoryId || conditions.length || hideSold || searchParams.get('minPrice') || searchParams.get('maxPrice') || searchParams.get('location');

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
        {/* Filters */}
        <aside>
          <div className="rounded-[10px] border-2 border-ink bg-white p-4 shadow-neo">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </h2>
              {hasFilters && (
                <button onClick={clearAll} className="text-xs font-bold underline">
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold">Category</label>
                <select className={selectClass} value={categoryId} onChange={(e) => changeCategory(e.target.value)}>
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {subcategories.length > 0 && (
                <div>
                  <label className="mb-1 block text-sm font-bold">Subcategory</label>
                  <select className={selectClass} value={subcategoryId} onChange={(e) => setParam('subcategory', e.target.value)}>
                    <option value="">All</option>
                    {subcategories.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-bold">Price (₹)</label>
                <div className="flex items-center gap-2">
                  <Input type="number" min="0" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                  <span className="text-ink/50">–</span>
                  <Input type="number" min="0" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold">Location</label>
                <Input
                  placeholder="City"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyPriceLocation()}
                />
              </div>

              <Button size="sm" variant="outline" className="w-full" onClick={applyPriceLocation}>
                Apply price &amp; location
              </Button>

              <div>
                <label className="mb-1 block text-sm font-bold">Condition</label>
                <div className="space-y-1">
                  {CONDITIONS.map((c) => (
                    <label key={c} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={conditions.includes(c)}
                        onChange={() => toggleCondition(c)}
                        className="h-4 w-4 accent-ink"
                      />
                      {c}
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={hideSold}
                  onChange={(e) => setParam('hideSold', e.target.checked ? 'true' : '')}
                  className="h-4 w-4 accent-ink"
                />
                Hide sold items
              </label>
            </div>
          </div>
        </aside>

        {/* Results */}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl">{q ? `Results for "${q}"` : 'Browse listings'}</h1>
              <p className="text-sm text-ink/60">
                {loading ? 'Loading…' : `${result.total} item${result.total === 1 ? '' : 's'}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold">Sort</label>
              <select className={`${selectClass} w-auto`} value={sort} onChange={(e) => setParam('sort', e.target.value)}>
                <option value="new">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="relevance">Relevance</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-[10px] border-2 border-ink bg-muted shadow-neo" />
              ))}
            </div>
          ) : result.items.length === 0 ? (
            <div className="rounded-[10px] border-2 border-ink bg-white p-10 text-center shadow-neo">
              <p className="font-heading text-lg font-bold">No listings found</p>
              <p className="text-ink/60">Try adjusting your filters or search.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {result.items.map((l) => (
                  <ListingCard key={l._id} listing={l} />
                ))}
              </div>
              <Pagination page={result.page} pages={result.pages} onChange={goToPage} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
