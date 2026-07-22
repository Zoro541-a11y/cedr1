'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/site/product-card';
import { useWishlist } from '@/lib/wishlist-context';
import { useLanguage } from '@/lib/language-context';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';

export default function WishlistPage() {
  const { t, locale } = useLanguage();
  const { ids, loading } = useWishlist();
  const { user } = useAuth();
  const supabase = getSupabaseBrowser();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!ids.length) {
      setProducts([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*), brand:brands(*)')
        .in('id', ids);
      setProducts((data ?? []) as unknown as Product[]);
    })();
  }, [ids, supabase]);

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted-foreground">{t('loading')}</div>;
  }

  if (!products.length) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
        <div className="glass-card mb-6 flex h-24 w-24 items-center justify-center rounded-full">
          <Heart className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">{locale === 'ar' ? 'قائمة المفضلة فارغة' : 'Your wishlist is empty'}</h1>
        <p className="mt-2 text-muted-foreground">{locale === 'ar' ? 'احفظ المنتجات التي تحبها هنا' : 'Save products you love to find them here'}</p>
        <Button asChild className="mt-6 rounded-full gradient-cedar text-white">
          <Link href="/categories">{locale === 'ar' ? 'تسوق الآن' : 'Start shopping'}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
        {t('wishlist')} <span className="text-base font-normal text-muted-foreground">({products.length})</span>
      </h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </div>
  );
}
