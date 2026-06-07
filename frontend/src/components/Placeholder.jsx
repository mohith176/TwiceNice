// Temporary stand-in for pages not yet built. Each gets replaced by its real
// page in the corresponding F-step.
export function Placeholder({ title }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="rounded-[10px] border-2 border-ink bg-white p-8 text-center shadow-neo">
        <h1 className="mb-2 text-3xl">{title}</h1>
        <p className="text-ink/60">This page is part of the build plan and will be implemented in its step.</p>
      </div>
    </div>
  );
}
