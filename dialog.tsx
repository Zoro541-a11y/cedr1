import { AdminBrands } from '@/components/admin/admin-brands';
import { fetchAllBrands } from '@/lib/queries';

export const revalidate = 0;

export default async function AdminBrandsPage() {
  const brands = await fetchAllBrands();
  return <AdminBrands initial={brands} />;
}
