import { Plus, Star, Package2, Heart } from 'lucide-react';
import { Product, getProductImage } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useI18n } from '../context/I18nContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { useState } from 'react';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { t } = useI18n();
  const { user } = useAuth();
  const [wished, setWished] = useState(false);

  const img = getProductImage(product);
  const hasDiscount = product.compare_at_price && Number(product.compare_at_price) > Number(product.price);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) { toast.error(t('outOfStock')); return; }
    addToCart(product);
    toast.success(`${product.name} ${t('addToCart')}`);
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { toast.error(t('signIn')); return; }
    if (wished) {
      await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', product.id);
      setWished(false);
    } else {
      await supabase.from('wishlist').insert({ user_id: user.id, product_id: product.id });
      setWished(true);
    }
  };

  return (
    <div className="product-card group cursor-pointer">
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
        {img ? (
          <img src={img} alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package2 className="h-10 w-10 text-gray-300 dark:text-gray-600" />
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white shadow-md">
            -{product.discount_percentage}% {t('off')}
          </span>
        )}
        {product.badge && (
          <span className="absolute top-2 right-2 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white shadow-md">
            {product.badge}
          </span>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-lg bg-white px-3 py-1 text-sm font-medium text-gray-900">{t('outOfStock')}</span>
          </div>
        )}
        <button onClick={toggleWishlist}
          className="absolute bottom-2 right-2 rounded-full bg-white/90 dark:bg-gray-900/90 p-2 shadow-md transition hover:scale-110 opacity-0 group-hover:opacity-100">
          <Heart className={`h-4 w-4 ${wished ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'}`} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="mb-1 line-clamp-2 text-sm font-medium text-gray-900 dark:text-gray-100">{product.name}</h3>
        {product.rating > 0 && (
          <div className="mb-2 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <Star className="h-3 w-3 fill-accent text-accent" />
            {Number(product.rating).toFixed(1)} ({product.reviews_count})
          </div>
        )}
        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-primary">${Number(product.price).toFixed(2)}</p>
            {hasDiscount && (
              <p className="text-xs text-gray-400 line-through">${Number(product.compare_at_price).toFixed(2)}</p>
            )}
          </div>
          <button onClick={handleAdd}
            disabled={product.stock <= 0}
            className="rounded-lg bg-primary p-2 text-white transition hover:bg-primary-600 hover:shadow-md disabled:opacity-30 active:scale-90">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
