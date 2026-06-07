// Currency: ₹ with Indian digit grouping. Free items show "Free".
export function formatPrice(price, isFree = false) {
  if (isFree || Number(price) === 0) return 'Free';
  return '₹' + Number(price).toLocaleString('en-IN');
}

// Up to two initials from a name, for the generated avatar.
export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
}

// "Member since June 2026"
export function memberSince(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

// Time for chat: clock if today, otherwise a short date.
export function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
