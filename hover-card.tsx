'use client';

import { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Mic, X, TrendingUp, History, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ProductCard } from '@/components/site/product-card';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { useLanguage } from '@/lib/language-context';
import { effectivePrice } from '@/lib/format';
import type { Product, Category, Brand } from '@/lib/types';

const HISTORY_KEY = 'cedar-search-history';
const POPULAR = ['headphones', 'shirt', 'serum', 'speaker', 'shoes', 'lamp', 'drill', 'handbag'];

function SearchContent() {
  const { t, locale } = useLanguage();
  const params = useSearchParams();
  const router = useRouter();
  const supabase = getSupabaseBrowser();
  const initialQ = params.get('q') ?? '';
  const initialSort = params.get('sort') ?? 'relevance';
  const initialFilter = params.get('filter') ?? '';
  const initialBrand = params.get('brand') ?? '';

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState(initialSort);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrand ? [initialBrand] : []);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: c }, { data: b }] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('brands').select('*').eq('is_active', true).order('name'),
      ]);
      setCategories((c ?? []) as Category[]);
      setBrands((b ?? []) as Brand[]);
    })();
    try {
      setHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]'));
    } catch { /* ignore */ }
  }, [supabase]);

  // suggestions (debounced)
  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    const id = setTimeout(async () => {
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*), brand:brands(*)')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%`)
        .limit(5);
      setSuggestions((data ?? []) as unknown as Product[]);
    }, 250);
    return () => clearTimeout(id);
  }, [query, supabase]);

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      let dbq = supabase
        .from('products')
        .select('*, category:categories(*), brand:brands(*)')
        .eq('is_active', true)
        .or(`name.ilike.%${q}%,description.ilike.%${q}%,sku.ilike.%${q}%`);
      if (initialFilter === 'featured') dbq = dbq.eq('is_featured', true);
      if (initialFilter === 'trending') dbq = dbq.eq('is_trending', true);
      if (initialFilter === 'bestseller') dbq = dbq.eq('is_bestseller', true);
      if (initialFilter === 'new') dbq = dbq.eq('is_new', true);
      if (initialSort === 'deals') dbq = dbq.gt('discount_percentage', 0).order('discount_percentage', { ascending: false });
      const { data } = await dbq.limit(48);
      setResults((data ?? []) as unknown as Product[]);
      setLoading(false);
      // save to history
      setHistory((prev) => {
        const next = [q, ...prev.filter((h) => h !== q)].slice(0, 8);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        return next;
      });
    },
    [supabase, initialFilter, initialSort]
  );

  useEffect(() => {
    if (initialQ) doSearch(initialQ);
  }, [initialQ, doSearch]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
    doSearch(query);
  };

  const startVoice = () => {
    const SR = (window as unknown as { webkitSpeechRecognition?: new () => { lang: string; onresult: (e: { results: { 0: { 0: { transcript: string } } } }[]) => void; onerror: () => void; start: () => void; }; SpeechRecognition?: new () => { lang: string; onresult: (e: { results: { 0: { 0: { transcript: string } } } }[]) => void; onerror: () => void; start: () => void; }; }).webkitSpeechRecognition || (window as unknown as { SpeechRecognition?: new () => { lang: string; onresult: (e: { results: { 0: { 0: { transcript: string } } } }[]) => void; onerror: () => void; start: () => void; }; }).SpeechRecognition;
    if (!SR) {
      alert(locale === 'ar' ? 'البحث الصوتي غير مدعوم في هذا المتصفح' : 'Voice search not supported in this browser');
      return;
    }
    const rec = new SR();
    rec.lang = locale === 'ar' ? 'ar-SA' : 'en-US';
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setQuery(text);
      doSearch(text);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  };

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  // client-side filtering + sorting on results
  const filtered = useMemo(() => {
    let list = [...results];
    if (selectedCats.length) list = list.filter((p) => p.category && selectedCats.includes(p.category.slug));
    if (selectedBrands.length) list = list.filter((p) => p.brand && selectedBrands.includes(p.brand.slug));
    list = list.filter((p) => {
      const price = effectivePrice(Number(p.price), p.discount_percentage);
      return price >= priceRange[0] && price <= priceRange[1];
    });
    if (sort === 'price-asc') list.sort((a, b) => effectivePrice(Number(a.price), a.discount_percentage) - effectivePrice(Number(b.price), b.discount_percentage));
    if (sort === 'price-desc') list.sort((a, b) => effectivePrice(Number(b.price), b.discount_percentage) - effectivePrice(Number(a.price), a.discount_percentage));
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    if (sort === 'newest') list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (sort === 'bestselling') list.sort((a, b) => b.sold_count - a.sold_count);
    return list;
  }, [results, selectedCats, selectedBrands, priceRange, sort]);

  const toggleCat = (slug: string) => setSelectedCats((p) => p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]);
  const toggleBrand = (slug: string) => setSelectedBrands((p) => p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]);

  const FilterContent = (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 font-semibold text-sm">Category</h4>
        <div className="space-y-1.5">
          {categories.map((c) => (
            <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={selectedCats.includes(c.slug)} onChange={() => toggleCat(c.slug)} className="accent-primary" />
              {c.name}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-2 font-semibold text-sm">Brand</h4>
        <div className="space-y-1.5">
          {brands.map((b) => (
            <label key={b.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={selectedBrands.includes(b.slug)} onChange={() => toggleBrand(b.slug)} className="accent-primary" />
              {b.name}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-2 font-semibold text-sm">Price range: ${priceRange[0]} - ${priceRange[1]}</h4>
        <input type="range" min={0} max={500} value={priceRange[1]} onChange={(e) => setPriceRange([0, Number(e.target.value)])} className="w-full accent-primary" />
      </div>
      <Button onClick={() => { setSelectedCats([]); setSelectedBrands([]); setPriceRange([0, 500]); }} variant="outline" className="w-full rounded-full">{t('clearAll')}</Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* search bar */}
      <form onSubmit={onSubmit} className="relative mb-6">
        <Search className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground ltr:left-4 rtl:right-4" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="h-12 rounded-full border-border/70 ltr:pl-11 ltr:pr-24 rtl:pr-11 rtl:pl-24"
          autoFocus
        />
        <div className="absolute top-1/2 flex -translate-y-1/2 items-center gap-1 ltr:right-2 rtl:left-2">
          <Button type="button" size="icon" variant="ghost" onClick={startVoice} className={`h-9 w-9 rounded-full ${listening ? 'text-destructive' : ''}`}>
            <Mic className="h-4 w-4" />
          </Button>
          <Button type="submit" size="sm" className="h-9 rounded-full gradient-cedar text-white">Search</Button>
        </div>
      </form>

      {/* suggestions dropdown */}
      {query.length >= 2 && suggestions.length > 0 && !results.length && (
        <div className="glass-card mb-6 overflow-hidden">
          <p className="border-b border-border/60 px-4 py-2 text-xs font-medium text-muted-foreground">{t('suggestions')}</p>
          {suggestions.map((s) => (
            <button
              key={s.id}
              onClick={() => { setQuery(s.name); router.push(`/search?q=${encodeURIComponent(s.name)}`); doSearch(s.name); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-start hover:bg-accent"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.media?.images?.[0]} alt={s.name} className="h-10 w-10 rounded object-cover" />
              <div className="flex-1">
                <p className="text-sm font-medium line-clamp-1">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.brand?.name}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* history + popular (when no query) */}
      {!query && !results.length && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold"><History className="h-4 w-4 text-primary" /> {t('searchHistory')}</h3>
              {history.length > 0 && <Button variant="ghost" size="sm" onClick={clearHistory}><X className="h-4 w-4" /></Button>}
            </div>
            {history.length ? (
              <div className="flex flex-wrap gap-2">
                {history.map((h, i) => (
                  <button key={i} onClick={() => { setQuery(h); doSearch(h); }} className="rounded-full bg-accent px-3 py-1.5 text-sm hover:bg-accent/70">{h}</button>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">{locale === 'ar' ? 'لا يوجد سجل بعد' : 'No history yet'}</p>}
          </div>
          <div className="glass-card p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><TrendingUp className="h-4 w-4 text-secondary" /> {t('popularSearches')}</h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR.map((p) => (
                <button key={p} onClick={() => { setQuery(p); doSearch(p); }} className="rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary hover:text-primary">{p}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* results */}
      {(results.length > 0 || loading) && (
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          {/* desktop filters */}
          <aside className="hidden lg:block">
            <div className="glass-card sticky top-24 p-5">
              <h3 className="mb-4 flex items-center gap-2 font-semibold"><SlidersHorizontal className="h-4 w-4" /> {t('filters')}</h3>
              {FilterContent}
            </div>
          </aside>

          <div>
            {/* toolbar */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {loading ? t('loading') : `${filtered.length} results`}
                {query && <> for "<span className="font-medium text-foreground">{query}</span>"</>}
              </p>
              <div className="flex items-center gap-2">
                {/* mobile filter sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-full lg:hidden"><SlidersHorizontal className="h-4 w-4" /> {t('filters')}</Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader><SheetTitle>{t('filters')}</SheetTitle></SheetHeader>
                    <div className="mt-4">{FilterContent}</div>
                  </SheetContent>
                </Sheet>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-40 rounded-full"><SelectValue placeholder={t('sortBy')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-asc">{t('priceLowHigh')}</SelectItem>
                    <SelectItem value="price-desc">{t('priceHighLow')}</SelectItem>
                    <SelectItem value="rating">{t('topRated')}</SelectItem>
                    <SelectItem value="newest">{t('newest')}</SelectItem>
                    <SelectItem value="bestselling">{t('bestSelling')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="shimmer aspect-[3/4] rounded-2xl" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            ) : (
              <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
                <p className="text-lg font-medium">{t('noResults')}</p>
                <p className="mt-1 text-sm text-muted-foreground">Try a different search term or browse categories.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted-foreground">Loading…</div>}>
      <SearchContent />
    </Suspense>
  );
}
