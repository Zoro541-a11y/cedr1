import { useEffect, useState, useCallback } from 'react';
import { Search, Filter, Package2, ArrowLeft } from 'lucide-react';
import { supabase, Product, Category } from '../lib/supabase';
import { useI18n } from '../context/I18nContext';
import { ProductCard } from './ProductCard';
import { toast } from 'sonner';

interface StorePageProps {
  initialSearch?: string;
  initialCategory?: string | null;
  onBack: () => void;
}

export function StorePage({ initialSearch = '', initialCategory = null, onBack }: StorePageProps) {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [filterCat, setFilterCat] = useState(initialCategory ?? 'all');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) { toast.error('Failed to load products'); }
    else { setProducts((data ?? []) as Product[]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      setCategories((data ?? []) as Category[]);
    })();
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (initialSearch) setSearch(initialSearch);
    if (initialCategory) setFilterCat(initialCategory);
  }, [initialSearch, initialCategory]);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || p.category_id === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 animate-fade-in">
      <button onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary transition">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('home')}
      </button>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('shop')}</h1>
        <div className="flex flex-1 gap-2 sm:max-w-lg">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search')}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
              className="appearance-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-2.5 pl-9 pr-8 text-sm outline-none focus:border-primary">
              <option value="all">{t('allCategories')}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {filtered.length} {t('items')}
      </p>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-gray-400">
          <Package2 className="h-8 w-8 animate-pulse" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 py-16 text-gray-400">
          <Package2 className="mb-2 h-10 w-10" />
          <p className="text-sm">{t('search')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
