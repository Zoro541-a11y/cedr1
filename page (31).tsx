import { AdminCoupons } from '@/components/admin/admin-coupons';
import { fetchAllCoupons } from '@/lib/queries';

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const coupons = await fetchAllCoupons();
  return <AdminCoupons initial={coupons} />;
}
