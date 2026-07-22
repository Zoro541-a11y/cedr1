import { AdminProducts } from '@/components/admin/admin-products';
import { supabaseServer } from '@/lib/supabase-server';
import { fetchCategories, fetchBrands } from '@/lib/queries';
import type { Product } from '@/lib/types';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const [{ data: products }, categories, brands] = await Promise.all([
    supabaseServer.from('products').select('*, category:categories(*), brand:brands(*)').order('created_at', { ascending: false }),
    fetchCategories(),
    fetchBrands(),
  ]);
  return <AdminProducts initialProducts={(products ?? []) as unknown as Product[]} categories={categories} brands={brands} />;
}
