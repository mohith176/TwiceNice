import { useState } from 'react';
import { Check, X } from 'lucide-react';
import api, { apiError } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { PW_RULES, passwordValid } from '../lib/passwordRules';
import { useAuth } from '../context/AuthContext';

const labelClass = 'mb-1 block text-sm font-bold';

export default function Settings() {
  const { user, updateUser } = useAuth();

  // --- Profile form ---
  const [profile, setProfile] = useState({ name: user.name, phone: user.phone || '', location: user.location });
  const [pSaving, setPSaving] = useState(false);
  const [pMsg, setPMsg] = useState('');
  const [pErr, setPErr] = useState('');

  async function saveProfile(e) {
    e.preventDefault();
    setPMsg('');
    setPErr('');
    if (!profile.name.trim() || !profile.location.trim()) {
      setPErr('Name and location are required.');
      return;
    }
    setPSaving(true);
    try {
      const { data } = await api.patch('/users/me', {
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        location: profile.location.trim(),
      });
      updateUser(data.user);
      setPMsg('Profile updated.');
    } catch (err) {
      setPErr(apiError(err));
    } finally {
      setPSaving(false);
    }
  }

  // --- Password form ---
  const [pw, setPw] = useState({ current: '', next: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const canChangePw = pw.current && passwordValid(pw.next);

  async function changePassword(e) {
    e.preventDefault();
    setPwMsg('');
    setPwErr('');
    setPwSaving(true);
    try {
      await api.patch('/users/me/password', { currentPassword: pw.current, newPassword: pw.next });
      setPw({ current: '', next: '' });
      setPwMsg('Password changed.');
    } catch (err) {
      setPwErr(apiError(err));
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 className="text-3xl">Account settings</h1>

      {/* Profile */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl">Profile</h2>
        {pMsg && <Banner ok>{pMsg}</Banner>}
        {pErr && <Banner>{pErr}</Banner>}
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className={labelClass}>Name</label>
            <Input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <Input value={user.email} disabled className="opacity-60" />
            <p className="mt-1 text-xs text-ink/50">Email can't be changed.</p>
          </div>
          <div>
            <label className={labelClass}>
              Phone <span className="font-normal text-ink/50">(optional, private)</span>
            </label>
            <Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <Input value={profile.location} onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))} />
          </div>
          <Button type="submit" disabled={pSaving}>
            {pSaving ? 'Saving…' : 'Save profile'}
          </Button>
        </form>
      </Card>

      {/* Password */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl">Change password</h2>
        {pwMsg && <Banner ok>{pwMsg}</Banner>}
        {pwErr && <Banner>{pwErr}</Banner>}
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className={labelClass}>Current password</label>
            <Input
              type="password"
              value={pw.current}
              onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className={labelClass}>New password</label>
            <Input
              type="password"
              value={pw.next}
              onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
              autoComplete="new-password"
            />
            <ul className="mt-2 space-y-1">
              {PW_RULES.map((r) => {
                const ok = r.test(pw.next);
                return (
                  <li key={r.label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-ink' : 'text-ink/40'}`}>
                    {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    {r.label}
                  </li>
                );
              })}
            </ul>
          </div>
          <Button type="submit" disabled={pwSaving || !canChangePw}>
            {pwSaving ? 'Changing…' : 'Change password'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function Banner({ children, ok }) {
  return (
    <div
      className={`mb-4 rounded-[6px] border-2 border-ink px-3 py-2 text-sm font-bold ${ok ? 'bg-success/30' : 'bg-danger/20'}`}
    >
      {children}
    </div>
  );
}
