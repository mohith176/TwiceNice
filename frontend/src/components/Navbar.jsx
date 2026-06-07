import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, MessageSquare, Heart, LayoutDashboard, Settings, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar } from './ui/avatar';

export function Navbar() {
  const { user, isAuthed, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Poll the unread-conversation count while logged in (the navbar badge).
  useEffect(() => {
    if (!isAuthed) {
      setUnread(0);
      return;
    }
    let active = true;
    const fetchUnread = () =>
      api
        .get('/conversations/unread-count')
        .then(({ data }) => active && setUnread(data.count))
        .catch(() => {});
    fetchUnread();
    const id = setInterval(fetchUnread, 15000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [isAuthed]);

  // Close the profile menu on an outside click.
  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function submitSearch(e) {
    e.preventDefault();
    navigate(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : '/');
  }

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-primary">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link to="/" className="shrink-0 font-heading text-2xl font-bold tracking-tight">
          Twice<span className="bg-ink px-1 text-primary">Nice</span>
        </Link>

        <form onSubmit={submitSearch} className="relative hidden flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/50" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search listings..." className="pl-9" />
        </form>

        <div className="ml-auto flex items-center gap-2">
          {isAuthed ? (
            <>
              <Button size="sm" onClick={() => navigate('/sell')}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Sell</span>
              </Button>
              <Link
                to="/messages"
                aria-label="Messages"
                className="relative flex h-11 w-11 items-center justify-center rounded-[6px] border-2 border-ink bg-white shadow-neo-sm transition-all hover:-translate-y-[1px]"
              >
                <MessageSquare className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-ink bg-pink px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </Link>
              <div className="relative" ref={menuRef}>
                <button onClick={() => setMenuOpen((o) => !o)} aria-label="Account menu">
                  <Avatar name={user.name} size="md" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-[10px] border-2 border-ink bg-white shadow-neo">
                    <div className="border-b-2 border-ink px-3 py-2">
                      <p className="truncate font-heading font-bold leading-tight">{user.name}</p>
                      <p className="truncate text-xs text-ink/60">{user.location}</p>
                    </div>
                    <MenuLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setMenuOpen(false)} />
                    <MenuLink to="/favorites" icon={Heart} label="Favorites" onClick={() => setMenuOpen(false)} />
                    <MenuLink to="/settings" icon={Settings} label="Settings" onClick={() => setMenuOpen(false)} />
                    {isAdmin && <MenuLink to="/admin" icon={Shield} label="Admin" onClick={() => setMenuOpen(false)} />}
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="flex w-full items-center gap-2 border-t-2 border-ink px-3 py-2 text-left font-bold hover:bg-muted"
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => navigate('/login')}>
                Log in
              </Button>
              <Button size="sm" onClick={() => navigate('/signup')}>
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile search row */}
      <form onSubmit={submitSearch} className="relative px-4 pb-3 md:hidden">
        <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/50" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search listings..." className="pl-9" />
      </form>
    </header>
  );
}

function MenuLink({ to, icon: Icon, label, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-2 px-3 py-2 font-bold hover:bg-muted">
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}
