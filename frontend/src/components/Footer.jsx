export function Footer() {
  return (
    <footer className="mt-auto border-t-2 border-ink bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-ink/60 sm:flex-row">
        <span className="font-heading font-bold text-ink">TwiceNice</span>
        <span>Buy &amp; sell second-hand, the nice way.</span>
        <span>© {new Date().getFullYear()} TwiceNice</span>
      </div>
    </footer>
  );
}
