import { AdminCategories } from '@/components/admin/admin-categories';
import { fetchCategories } from '@/lib/queries';

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const categories = await fetchCategories();
  return <AdminCategories initial={categories} />;
}
