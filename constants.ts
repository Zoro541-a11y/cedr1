'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { getSupabaseBrowser } from './supabase-browser';
import { useAuth } from './auth-context';

interface WishlistContextValue {
  ids: string[];
  count: number;
  loading: boolean;
  toggle: (productId: string) => Promise<void>;
  has: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);
const LOCAL_KEY = 'cedar-wishlist-local';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabaseBrowser();
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      try {
        const raw = localStorage.getItem(LOCAL_KEY);
        setIds(raw ? JSON.parse(raw) : []);
      } catch {
        setIds([]);
      }
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      const { data } = await supabase.from('wishlist').select('product_id').eq('user_id', user.id);
      setIds((data ?? []).map((r) => r.product_id));
      setLoading(false);
    })();
  }, [user, supabase]);

  useEffect(() => {
    if (!user) localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
  }, [ids, user]);

  const toggle = useCallback(
    async (productId: string) => {
      if (user) {
        if (ids.includes(productId)) {
          await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId);
          setIds((p) => p.filter((id) => id !== productId));
        } else {
          await supabase.from('wishlist').insert({ user_id: user.id, product_id: productId });
          setIds((p) => [...p, productId]);
        }
      } else {
        setIds((p) =>
          p.includes(productId) ? p.filter((id) => id !== productId) : [...p, productId]
        );
      }
    },
    [user, supabase, ids]
  );

  const has = useCallback((productId: string) => ids.includes(productId), [ids]);

  return (
    <WishlistContext.Provider value={{ ids, count: ids.length, loading, toggle, has }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
