import { Button } from './button';

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  const start = Math.max(1, page - 2);
  const end = Math.min(pages, page + 2);
  const nums = [];
  for (let i = start; i <= end; i++) nums.push(i);

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Prev
      </Button>
      {start > 1 && <span className="px-1 font-bold">…</span>}
      {nums.map((n) => (
        <Button key={n} size="sm" variant={n === page ? 'default' : 'outline'} onClick={() => onChange(n)}>
          {n}
        </Button>
      ))}
      {end < pages && <span className="px-1 font-bold">…</span>}
      <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next
      </Button>
    </div>
  );
}
