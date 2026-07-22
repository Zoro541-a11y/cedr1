import { AdminShell } from '@/components/admin/admin-shell';

export const metadata = {
  title: { default: 'Admin Dashboard', template: '%s | Cedar Admin' },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
