import { useEffect, useState } from 'react';
import {
  Search, ShoppingBag, Zap, TrendingUp, Sparkles, ChevronLeft, ChevronRight,
  Truck, ShieldCheck, BadgeCheck, Headphones, Package2, Clock, ArrowRight,
} from 'lucide-react';
import { supabase, Product, Category, getProductImage } from '../lib/supabase';
import { useI18n } from '../context/I18nContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from './ProductCard';
import { toast } from 'sonner';

const CATEGORY_ICONS: Record<string, string> = {
  'Electronics': '📱', 'Fashion': '👗', 'Home & Living': '🏠', 'Beauty & Health': '💄',
  'Sports & Outdoors': '⚽', 'Toys & Kids': '🧸', 'Automotive': '🚗', 'Garden': '🌿',
};

interface LandingPageProps {
  onShopNow: () => void;
  onExploreDeals: () => void;
  onCategoryClick: (catId: string) => void;
  onViewAll: (section: string) => void;
  onSearch: (query: string) => void;
}

export function LandingPage({ onShopNow, onExploreDeals, onCategoryClick, onViewAll, onSearch }: LandingPageProps) {
  const { t, lang } = useI18n();
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [flashSale, setFlashSale] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [flashHours, setFlashHours] = useState(5);
  const [flashMins, setFlashMins] = useState(59);
  const [flashSecs, setFlashSecs] = useState(59);

  useEffect(() => {
    const timer = setInterval(() => {
      setFlashSecs((s) => {
        if (s > 0) return s - 1;
        setFlashMins((m) => {
          if (m > 0) return m - 1;
          setFlashHours((h) => (h > 0 ? h - 1 : 5));
          return 59;
        });
        return 59;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    (async () => {
      const [catsRes, featRes, flashRes, bestRes, newRes] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('products').select('*').eq('is_active', true).eq('is_featured', true).limit(8),
        supabase.from('products').select('*').eq('is_active', true).eq('is_flash_sale', true).limit(6),
        supabase.from('products').select('*').eq('is_active', true).eq('is_bestseller', true).limit(8),
        supabase.from('products').select('*').eq('is_active', true).eq('is_new', true).order('created_at', { ascending: false }).limit(8),
      ]);

      setCategories((catsRes.data ?? []) as Category[]);
      setFeatured((featRes.data ?? []) as Product[]);
      setFlashSale((flashRes.data ?? []) as Product[]);
      setBestSellers((bestRes.data ?? []) as Product[]);
      setNewArrivals((newRes.data ?? []) as Product[]);
      setLoading(false);
    })();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const heroImages = featured.slice(0, 3);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-600 to-primary-800 dark:from-primary-800 dark:via-primary-900 dark:to-gray-950">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary-400/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 lg:py-24">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            {/* Text content */}
            <div className="animate-slide-up text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-4 py-1.5 text-sm font-medium text-white">
                <Sparkles className="h-4 w-4 text-accent" />
                {lang === 'ar' ? 'تسوق بثقة في لبنان' : 'Trusted shopping in Lebanon'}
              </div>
              <h1 className="mb-4 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                {t('heroTitle')}
              </h1>
              <p className="mb-8 text-base text-white/80 lg:text-lg">
                {t('heroSubtitle')}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <button onClick={onShopNow}
                  className="btn-accent flex items-center justify-center gap-2 text-base">
                  <ShoppingBag className="h-5 w-5" /> {t('shopNow')}
                </button>
                <button onClick={onExploreDeals}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-md px-6 py-3 text-base font-semibold text-white transition hover:bg-white/20">
                  <Zap className="h-5 w-5" /> {t('exploreDeals')}
                </button>
              </div>

              {/* Trust badges */}
              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { icon: Truck, title: t('freeDelivery'), desc: t('freeDeliveryDesc') },
                  { icon: ShieldCheck, title: t('securePayment'), desc: t('securePaymentDesc') },
                  { icon: BadgeCheck, title: t('qualityProducts'), desc: t('qualityProductsDesc') },
                  { icon: Headphones, title: t('support'), desc: t('supportDesc') },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl bg-white/10 backdrop-blur-md p-3 text-center transition hover:bg-white/15">
                    <item.icon className="mx-auto mb-1 h-5 w-5 text-accent" />
                    <p className="text-xs font-semibold text-white">{item.title}</p>
                    <p className="text-[10px] text-white/60">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating product images */}
            <div className="relative hidden h-96 lg:block">
              {heroImages.length >= 3 && (
                <>
                  <div className="absolute top-4 right-8 w-48 animate-float">
                    <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
                      <img src={getProductImage(heroImages[0]) ?? ''} alt={heroImages[0].name}
                        className="h-48 w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <div className="p-2">
                        <p className="line-clamp-1 text-xs font-medium text-gray-900">{heroImages[0].name}</p>
                        <p className="text-sm font-bold text-primary">${Number(heroImages[0].price).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-32 left-4 w-44 animate-float-delayed">
                    <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
                      <img src={getProductImage(heroImages[1]) ?? ''} alt={heroImages[1].name}
                        className="h-40 w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <div className="p-2">
                        <p className="line-clamp-1 text-xs font-medium text-gray-900">{heroImages[1].name}</p>
                        <p className="text-sm font-bold text-primary">${Number(heroImages[1].price).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-20 w-40 animate-float">
                    <div className="overflow-hidden rounded-2xl bg-white shadow-2xl" style={{ animationDelay: '1s' }}>
                      <img src={getProductImage(heroImages[2]) ?? ''} alt={heroImages[2].name}
                        className="h-36 w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <div className="p-2">
                        <p className="line-clamp-1 text-xs font-medium text-gray-900">{heroImages[2].name}</p>
                        <p className="text-sm font-bold text-primary">${Number(heroImages[2].price).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {heroImages.length === 0 && (
                <div className="flex h-full items-center justify-center">
                  <ShoppingBag className="h-24 w-24 text-white/30" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <svg className="block w-full" viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ height: '40px' }}>
          <path fill="currentColor" className="text-gray-50 dark:text-gray-950" d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
        </svg>
      </section>

      {/* Featured Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('featuredCategories')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('featuredCategoriesDesc')}</p>
          </div>
          <button onClick={() => onViewAll('categories')}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all">
            {t('viewAll')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {categories.map((cat, i) => (
              <button key={cat.id} onClick={() => onCategoryClick(cat.id)}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-scale-in"
                style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30 text-2xl transition group-hover:scale-110 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50">
                  {CATEGORY_ICONS[cat.name] ?? '📦'}
                </div>
                <p className="text-center text-xs font-medium text-gray-700 dark:text-gray-300">{cat.name}</p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Flash Sale */}
      {flashSale.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-6">
          <div className="rounded-3xl bg-gradient-to-r from-red-500 via-orange-500 to-accent p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{t('flashSale')}</h2>
                  <p className="text-sm text-white/80">{t('flashSaleDesc')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white/90">{t('endsIn')}</span>
                <div className="flex gap-1.5">
                  {[
                    { val: flashHours, label: 'H' },
                    { val: flashMins, label: 'M' },
                    { val: flashSecs, label: 'S' },
                  ].map((unit, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md text-sm font-bold text-white tabular-nums">
                        {String(unit.val).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-white/60">{unit.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {flashSale.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('featuredProducts')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('featuredProductsDesc')}</p>
          </div>
          <button onClick={() => onViewAll('featured')}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all">
            {t('viewAll')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="bg-white dark:bg-gray-900 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                  <TrendingUp className="h-6 w-6 text-accent" /> {t('bestSellers')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('bestSellersDesc')}</p>
              </div>
              <button onClick={() => onViewAll('bestsellers')}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all">
                {t('viewAll')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {bestSellers.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                <Sparkles className="h-6 w-6 text-primary" /> {t('newArrivals')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('newArrivalsDesc')}</p>
            </div>
            <button onClick={() => onViewAll('new')}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all">
                {t('viewAll')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">Cedar Store</span>
          </div>
          <p className="text-sm text-gray-400">{t('lebanonMarketplace')} · {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
