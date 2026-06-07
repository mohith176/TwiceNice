import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { PW_RULES } from '../lib/passwordRules';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ name: '', email: '', password: '', location: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const pwOk = PW_RULES.every((r) => r.test(form.password));
  const canSubmit =
    form.name.trim() && /^\S+@\S+\.\S+$/.test(form.email) && form.location.trim() && pwOk;

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!canSubmit) {
      setError('Please complete all required fields correctly.');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        location: form.location.trim(),
        phone: form.phone.trim(),
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(apiError(err, 'Signup failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card className="p-6">
        <h1 className="mb-1 text-2xl">Create your account</h1>
        <p className="mb-5 text-sm text-ink/60">Join TwiceNice to buy and sell second-hand.</p>

        {error && (
          <div className="mb-4 rounded-[6px] border-2 border-ink bg-danger/20 px-3 py-2 text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-bold">Name</label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Your name" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Password</label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
            <ul className="mt-2 space-y-1">
              {PW_RULES.map((r) => {
                const ok = r.test(form.password);
                return (
                  <li key={r.label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-ink' : 'text-ink/40'}`}>
                    {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    {r.label}
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Location</label>
            <Input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="City" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">
              Phone <span className="font-normal text-ink/50">(optional)</span>
            </label>
            <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Phone number" />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !canSubmit}>
            {loading ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="font-bold underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
