import { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

// Holds the set of listing ids the current user has favorited, so the heart
// toggle is consistent everywhere (browse, detail, profile, favorites page).
export function FavoritesProvider({ children }) {
  const { isAuthed } = useAuth();
  const [ids, setIds] = useState(() => new Set());

  useEffect(() => {
    if (!isAuthed) {
      setIds(new Set());
      return;
    }
    api
      .get('/favorites')
      .then(({ data }) => setIds(new Set(data.items.map((l) => l._id))))
      .catch(() => {});
  }, [isAuthed]);

  const isFavorite = (id) => ids.has(id);

  // Optimistic toggle: flip immediately, revert if the request fails.
  async function toggle(id) {
    const had = ids.has(id);
    setIds((prev) => {
      const next = new Set(prev);
      if (had) next.delete(id);
      else next.add(id);
      return next;
    });
    try {
      if (had) await api.delete(`/favorites/${id}`);
      else await api.post(`/favorites/${id}`);
    } catch {
      setIds((prev) => {
        const next = new Set(prev);
        if (had) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  }

  return (
    <FavoritesContext.Provider value={{ isFavorite, toggle, count: ids.size }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within a FavoritesProvider');
  return ctx;
}
