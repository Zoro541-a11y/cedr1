import { supabaseServer } from './supabase-server';
import type { Product, Category, Brand, Coupon } from './types';

export async function fetchFeaturedProducts(limit = 12): Promise<Product[]> {
  const { data } = await supabaseServer
    .from('products')
    .select('*, category:categories(*), brand:brands(*)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('sold_count', { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as Product[];
}

export async function fetchFlashSaleProducts(limit = 10): Promise<Product[]> {
  const { data } = await supabaseServer
    .from('products')
    .select('*, category:categories(*), brand:brands(*)')
    .eq('is_active', true)
    .eq('is_flash_sale', true)
    .limit(limit);
  return (data ?? []) as unknown as Product[];
}

export async function fetchTrendingProducts(limit = 12): Promise<Product[]> {
  const { data } = await supabaseServer
    .from('products')
    .select('*, category:categories(*), brand:brands(*)')
    .eq('is_active', true)
    .eq('is_trending', true)
    .order('sold_count', { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as Product[];
}

export async function fetchBestSellers(limit = 12): Promise<Product[]> {
  const { data } = await supabaseServer
    .from('products')
    .select('*, category:categories(*), brand:brands(*)')
    .eq('is_active', true)
    .eq('is_bestseller', true)
    .order('sold_count', { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as Product[];
}

export async function fetchNewArrivals(limit = 12): Promise<Product[]> {
  const { data } = await supabaseServer
    .from('products')
    .select('*, category:categories(*), brand:brands(*)')
    .eq('is_active', true)
    .eq('is_new', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as Product[];
}

export async function fetchTodaysDeals(limit = 12): Promise<Product[]> {
  const { data } = await supabaseServer
    .from('products')
    .select('*, category:categories(*), brand:brands(*)')
    .eq('is_active', true)
    .gt('discount_percentage', 0)
    .order('discount_percentage', { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as Product[];
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await supabaseServer
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return (data ?? []) as unknown as Category[];
}

export async function fetchBrands(): Promise<Brand[]> {
  const { data } = await supabaseServer
    .from('brands')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });
  return (data ?? []) as unknown as Brand[];
}

export async function fetchAllBrands(): Promise<Brand[]> {
  const { data } = await supabaseServer
    .from('brands')
    .select('*')
    .order('name', { ascending: true });
  return (data ?? []) as unknown as Brand[];
}

export async function fetchAllCoupons(): Promise<Coupon[]> {
  const { data } = await supabaseServer
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });
  return (data ?? []) as unknown as Coupon[];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data } = await supabaseServer
    .from('products')
    .select('*, category:categories(*), brand:brands(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  return (data as unknown as Product) ?? null;
}

export async function fetchProductsByCategory(slug: string, limit = 24): Promise<Product[]> {
  const { data: cat } = await supabaseServer
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (!cat) return [];
  const { data } = await supabaseServer
    .from('products')
    .select('*, category:categories(*), brand:brands(*)')
    .eq('is_active', true)
    .eq('category_id', cat.id)
    .limit(limit);
  return (data ?? []) as unknown as Product[];
}

export async function searchProducts(query: string, limit = 24): Promise<Product[]> {
  const { data } = await supabaseServer
    .from('products')
    .select('*, category:categories(*), brand:brands(*)')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,sku.ilike.%${query}%`)
    .limit(limit);
  return (data ?? []) as unknown as Product[];
}

export async function fetchRelatedProducts(product: Product, limit = 8): Promise<Product[]> {
  if (!product.category_id) return [];
  const { data } = await supabaseServer
    .from('products')
    .select('*, category:categories(*), brand:brands(*)')
    .eq('is_active', true)
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .limit(limit);
  return (data ?? []) as unknown as Product[];
}
