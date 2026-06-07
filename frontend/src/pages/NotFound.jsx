import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="rounded-[10px] border-2 border-ink bg-white p-8 shadow-neo">
        <p className="font-heading text-6xl font-bold">404</p>
        <h1 className="mt-2 text-2xl">Page not found</h1>
        <p className="mt-1 text-ink/60">That page doesn't exist or may have moved.</p>
        <Link to="/" className="mt-5 inline-block">
          <Button>Back to browse</Button>
        </Link>
      </div>
    </div>
  );
}
