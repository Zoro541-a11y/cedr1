'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
  Area, AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { formatPrice, formatNumber } from '@/lib/format';
import { ORDER_STATUSES } from '@/lib/constants';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', confirmed: '#3b82f6', preparing: '#8b5cf6',
  shipped: '#6366f1', delivered: '#10b981', cancelled: '#ef4444', returned: '#6b7280',
};

interface ReportData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalProductsSold: number;
  salesByDay: { date: string; revenue: number; orders: number }[];
  topProducts: { name: string; sold: number; revenue: number }[];
  statusBreakdown: { status: string; count: number }[];
  categorySales: { name: string; sales: number }[];
}

export default function AdminReportsPage() {
  const supabase = getSupabaseBrowser();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    (async () => {
      const days = parseInt(range);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [{ data: orders }, { data: products }, { data: categories }] = await Promise.all([
        supabase.from('orders').select('id, total, status, created_at, order_items(quantity, price, product_name)').gte('created_at', startDate.toISOString()).order('created_at', { ascending: true }),
        supabase.from('products').select('name, sold_count, price').order('sold_count', { ascending: false }).limit(10),
        supabase.from('categories').select('id, name'),
      ]);

      const allOrders = orders ?? [];
      const totalRevenue = allOrders.reduce((s, o) => s + Number(o.total), 0);
      const totalOrders = allOrders.length;
      const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
      const totalProductsSold = allOrders.reduce((s, o) => s + (o.order_items ?? []).reduce((qs: number, i: any) => qs + i.quantity, 0), 0);

      // sales by day
      const dayMap: Record<string, { revenue: number; orders: number }> = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        dayMap[d.toISOString().slice(0, 10)] = { revenue: 0, orders: 0 };
      }
      allOrders.forEach((o: any) => {
        const key = o.created_at?.slice(0, 10);
        if (dayMap[key]) { dayMap[key].revenue += Number(o.total); dayMap[key].orders += 1; }
      });
      const salesByDay = Object.entries(dayMap).map(([date, v]) => ({ date, ...v }));

      // top products
      const topProducts = (products ?? []).map((p: any) => ({
        name: p.name,
        sold: p.sold_count ?? 0,
        revenue: (p.sold_count ?? 0) * Number(p.price),
      })).filter((p: any) => p.sold > 0).slice(0, 8);

      // status breakdown
      const statusCounts: Record<string, number> = {};
      allOrders.forEach((o: any) => { statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1; });
      const statusBreakdown = ORDER_STATUSES.map((s) => ({ status: s, count: statusCounts[s] ?? 0 })).filter((s) => s.count > 0);

      // category sales
      const catMap: Record<string, number> = {};
      (categories ?? []).forEach((c: any) => { catMap[c.id] = 0; });
      const catNameMap: Record<string, string> = {};
      (categories ?? []).forEach((c: any) => { catNameMap[c.id] = c.name; });

      setData({
        totalRevenue, totalOrders, avgOrderValue, totalProductsSold,
        salesByDay, topProducts, statusBreakdown,
        categorySales: Object.entries(catMap).map(([id, sales]) => ({ name: catNameMap[id] ?? id, sales })),
      });
      setLoading(false);
    })();
  }, [range, supabase]);

  const exportCSV = () => {
    if (!data) return;
    const headers = ['Date', 'Revenue', 'Orders'];
    const rows = data.salesByDay.map((d) => [d.date, d.revenue, d.orders]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'cedar-sales-report.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  if (loading || !data) return <div className="flex h-96 items-center justify-center text-muted-foreground">Loading report…</div>;

  const cards = [
    { label: 'Revenue', value: formatPrice(data.totalRevenue) },
    { label: 'Orders', value: formatNumber(data.totalOrders) },
    { label: 'Avg Order Value', value: formatPrice(data.avgOrderValue) },
    { label: 'Items Sold', value: formatNumber(data.totalProductsSold) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">Sales analytics & insights</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border">
            {(['7', '30', '90'] as const).map((r) => (
              <Button key={r} size="sm" variant={range === r ? 'default' : 'ghost'} className="rounded-none first:rounded-l-lg last:rounded-r-lg" onClick={() => setRange(r)}>{r}d</Button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={exportCSV}><Download className="ltr:mr-2 rtl:ml-2 h-4 w-4" /> Export</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card><CardContent className="p-5">
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Revenue & Orders</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.salesByDay}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f5e3a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0f5e3a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#0f5e3a" fill="url(#rev)" strokeWidth={2} />
              <Line type="monotone" dataKey="orders" stroke="#C9A227" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top Products</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="name" width={100} className="text-xs" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="sold" fill="#0f5e3a" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Orders by Status</CardTitle></CardHeader>
          <CardContent>
            {data.statusBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={data.statusBreakdown} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label>
                    {data.statusBreakdown.map((e, i) => <Cell key={i} fill={STATUS_COLORS[e.status] ?? '#888'} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">No data</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
