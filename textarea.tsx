'use client';

import { TrendingUp, ShoppingCart, DollarSign, Package, Users, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminStats } from '@/components/admin/use-admin-stats';
import { formatPrice, formatNumber, formatDateTime } from '@/lib/format';
import { ORDER_STATUSES } from '@/lib/constants';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  preparing: '#8b5cf6',
  shipped: '#6366f1',
  delivered: '#10b981',
  cancelled: '#ef4444',
  returned: '#6b7280',
};

export default function AdminDashboard() {
  const { stats, loading } = useAdminStats();

  if (loading || !stats) {
    return <div className="flex h-96 items-center justify-center text-muted-foreground">Loading dashboard…</div>;
  }

  const cards = [
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'from-green-500 to-emerald-600', trend: '+12%' },
    { label: 'Total Orders', value: formatNumber(stats.totalOrders), icon: ShoppingCart, color: 'from-blue-500 to-indigo-600', trend: '+8%' },
    { label: 'Products', value: formatNumber(stats.totalProducts), icon: Package, color: 'from-purple-500 to-violet-600', trend: '+3%' },
    { label: 'Customers', value: formatNumber(stats.totalCustomers), icon: Users, color: 'from-amber-500 to-orange-600', trend: '+15%' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your store performance</p>
      </div>

      {/* stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-white`}>
                    <c.icon className="h-5 w-5" />
                  </div>
                  <span className="flex items-center gap-0.5 text-xs font-medium text-green-600">
                    <ArrowUpRight className="h-3 w-3" /> {c.trend}
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold">{c.value}</p>
                <p className="text-sm text-muted-foreground">{c.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* alerts */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
            <div>
              <p className="font-semibold">{stats.pendingOrders} pending orders</p>
              <Link href="/admin/orders?status=pending" className="text-sm text-primary hover:underline">Review now →</Link>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <p className="font-semibold">{stats.lowStock} low-stock products</p>
              <Link href="/admin/products?filter=lowstock" className="text-sm text-primary hover:underline">Manage stock →</Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Sales (last 7 days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.salesByDay}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="revenue" fill="#0f5e3a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Orders by Status</CardTitle></CardHeader>
          <CardContent>
            {stats.ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={stats.ordersByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label>
                    {stats.ordersByStatus.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.status] ?? '#888'} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">No order data yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* recent orders + top products */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center justify-between"><span>Recent Orders</span><Link href="/admin/orders" className="text-sm text-primary hover:underline">View all</Link></CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {stats.recentOrders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet</p>}
            {stats.recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">{o.customer_name} · {formatDateTime(o.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge style={{ backgroundColor: STATUS_COLORS[o.status], color: 'white' }}>{o.status}</Badge>
                  <span className="text-sm font-bold text-primary">{formatPrice(o.total)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center justify-between"><span>Top Products</span><Link href="/admin/products" className="text-sm text-primary hover:underline">View all</Link></CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {stats.topProducts.length === 0 && <p className="text-sm text-muted-foreground">No products yet</p>}
            {stats.topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium line-clamp-1">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{formatNumber(p.sold_count)} sold</p>
                </div>
                <span className="text-sm font-bold">{formatPrice(p.price)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
