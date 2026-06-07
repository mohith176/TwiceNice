// Frontend mirror of the backend's strict password policy, for instant feedback.
export const PW_RULES = [
  { test: (p) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p) => /[A-Z]/.test(p), label: 'An uppercase letter' },
  { test: (p) => /[a-z]/.test(p), label: 'A lowercase letter' },
  { test: (p) => /[0-9]/.test(p), label: 'A number' },
  { test: (p) => /[^A-Za-z0-9]/.test(p), label: 'A symbol' },
];

export const passwordValid = (p) => PW_RULES.every((r) => r.test(p));
