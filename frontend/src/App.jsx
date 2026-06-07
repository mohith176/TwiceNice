import { Search, Heart, Plus } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardFooter } from './components/ui/card';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';

// Temporary F0 showcase page to verify the neobrutalism theme.
// It gets replaced by the real app shell + pages in F1 onward.
const demo = [
  { title: 'iPhone 12 (128GB)', price: '₹32,000', cond: 'Like New', loc: 'Hyderabad', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=60' },
  { title: 'Royal Enfield Classic 350', price: '₹1,20,000', cond: 'Good', loc: 'Bangalore', img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=60', sold: true },
  { title: 'Used Novel Bundle', price: 'Free', cond: 'Good', loc: 'Bangalore', img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=60', free: true },
];

export default function App() {
  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="border-b-2 border-ink bg-primary">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="font-heading text-2xl font-bold tracking-tight">
            Twice<span className="bg-ink px-1 text-primary">Nice</span>
          </div>
          <div className="hidden flex-1 items-center md:flex">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/50" />
              <Input placeholder="Search listings..." className="pl-9" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm">
              <Plus className="h-4 w-4" /> Sell
            </Button>
            <Button size="sm" variant="outline">
              Log in
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-6 pt-10">
        <h1 className="text-4xl md:text-5xl">Buy &amp; sell second-hand, the nice way.</h1>
        <p className="mt-3 max-w-xl text-ink/70">
          A lightweight marketplace for pre-loved things. List in seconds, message sellers, find a bargain.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button size="lg">Browse listings</Button>
          <Button size="lg" variant="secondary">
            Start selling
          </Button>
          <Button size="lg" variant="outline">
            How it works
          </Button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge>Electronics</Badge>
          <Badge variant="info">Furniture</Badge>
          <Badge variant="free">Free stuff</Badge>
          <Badge variant="neutral">Vehicles</Badge>
        </div>
      </section>

      {/* Listing grid */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="mb-4 text-2xl">Fresh finds</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {demo.map((d) => (
            <Card key={d.title} className="overflow-hidden">
              <div className="relative border-b-2 border-ink">
                <img src={d.img} alt={d.title} className="h-44 w-full object-cover" />
                <button className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-white shadow-neo-sm">
                  <Heart className="h-4 w-4" />
                </button>
                {d.sold && (
                  <span className="absolute left-2 top-2">
                    <Badge variant="sold">SOLD</Badge>
                  </span>
                )}
              </div>
              <CardContent className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading font-bold leading-tight">{d.title}</h3>
                  <Badge variant={d.free ? 'free' : 'default'}>{d.price}</Badge>
                </div>
                <p className="text-sm text-ink/60">
                  {d.cond} · {d.loc}
                </p>
              </CardContent>
              <CardFooter className="justify-between">
                <span className="text-sm font-bold">View details</span>
                <Button size="sm" variant="info">
                  Message
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
