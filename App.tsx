import { useEffect, useState, useCallback } from 'react';
import { Heart, ChevronRight, Trash2 } from 'lucide-react';
import { supabase, Product, getProductImage } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

export function WishlistPage({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('wishlist')
      .select('product_id, products(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) { toast.error('Failed to load wishlist'); }
    else {
      const items = (data ?? []).map((row: any) => row.products as Product).filter(Boolean);
      setProducts(items);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const removeItem = async (productId: string) => {
    if (!user) return;
    await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`${product.name} ${t('addToCart')}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 animate-fade-in">
      <button onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary transition">
        <ChevronRight className="h-4 w-4 rotate-180 rtl:rotate-0" /> {t('home')}
      </button>

      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">{t('yourWishlist')}</h1>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-gray-400">
          <Heart className="h-8 w-8 animate-pulse" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 py-16 text-gray-400">
          <Heart className="mb-3 h-12 w-12" />
          <p className="text-base font-medium">{t('emptyWishlist')}</p>
          <p className="text-sm">{t('emptyWishlistDesc')}</p>
          <button onClick={onBack}
            className="mt-4 btn-primary text-sm">
            {t('shopNow')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const img = getProductImage(p);
            return (
              <div key={p.id} className="flex gap-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 transition hover:shadow-md">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800">
                  {img ? (
                    <img src={img} alt={p.name} className="h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Heart className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <h4 className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-white">{p.name}</h4>
                  <p className="text-sm font-bold text-primary">${Number(p.price).toFixed(2)}</p>
                  <div className="mt-auto flex items-center gap-2">
                    <button onClick={() => handleAddToCart(p)}
                      disabled={p.stock <= 0}
                      className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition hover:bg-primary-600 disabled:opacity-30">
                      {t('addToCart')}
                    </button>
                    <button onClick={() => removeItem(p.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
