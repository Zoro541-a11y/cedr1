'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Eye, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { formatPrice, formatDateTime } from '@/lib/format';
import { ORDER_STATUSES, ORDER_STATUS_FLOW } from '@/lib/constants';
import type { Order, OrderStatus } from '@/lib/types';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500',
  confirmed: 'bg-blue-500',
  preparing: 'bg-purple-500',
  shipped: 'bg-indigo-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
  returned: 'bg-gray-500',
};

function OrdersContent() {
  const supabase = getSupabaseBrowser();
  const params = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(params.get('status') ?? 'all');
  const [selected, setSelected] = useState<Order | null>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (statusFilter !== 'all') q = q.eq('status', statusFilter);
    if (search) q = q.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`);
    const { data } = await q.limit(100);
    setOrders((data ?? []) as Order[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter, search]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) { toast.error('Failed to update'); return; }
    await supabase.from('order_status_history').insert({ order_id: orderId, status, note: `Status changed to ${status}` });
    setOrders((p) => p.map((o) => (o.id === orderId ? { ...o, status } : o)));
    setSelected((s) => (s && s.id === orderId ? { ...s, status } : s));
    toast.success(`Order ${status}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">Manage and track customer orders</p>
      </div>

      {/* filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order #, name, phone..." className="ltr:pl-9 rtl:pr-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">Order</th>
                  <th className="px-4 py-3 text-start font-medium">Customer</th>
                  <th className="px-4 py-3 text-start font-medium">Date</th>
                  <th className="px-4 py-3 text-start font-medium">Status</th>
                  <th className="px-4 py-3 text-start font-medium">Total</th>
                  <th className="px-4 py-3 text-end font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">Loading…</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">No orders found</td></tr>
                ) : orders.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs">{o.order_number}</td>
                    <td className="px-4 py-3"><p className="font-medium">{o.customer_name}</p><p className="text-xs text-muted-foreground">{o.customer_phone}</p></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTime(o.created_at)}</td>
                    <td className="px-4 py-3"><Badge className={`${STATUS_COLORS[o.status]} text-white`}>{o.status}</Badge></td>
                    <td className="px-4 py-3 font-bold text-primary">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3 text-end"><Button size="sm" variant="ghost" onClick={() => setSelected(o)}><Eye className="h-4 w-4" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader><DialogTitle className="font-mono">{selected.order_number}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-muted-foreground">Customer</p><p className="font-medium">{selected.customer_name}</p></div>
                  <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{selected.customer_phone}</p></div>
                  <div><p className="text-muted-foreground">Address</p><p className="font-medium">{selected.street}, {selected.city}, {selected.country}</p></div>
                  <div><p className="text-muted-foreground">Date</p><p className="font-medium">{formatDateTime(selected.created_at)}</p></div>
                  {selected.notes && <div className="col-span-2"><p className="text-muted-foreground">Notes</p><p>{selected.notes}</p></div>}
                </div>

                {/* items */}
                <div className="rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30"><tr><th className="px-3 py-2 text-start">Item</th><th className="px-3 py-2 text-end">Qty</th><th className="px-3 py-2 text-end">Price</th></tr></thead>
                    <tbody>
                      {selected.order_items?.map((item) => (
                        <tr key={item.id} className="border-t border-border">
                          <td className="px-3 py-2">{item.product_name}</td>
                          <td className="px-3 py-2 text-end">{item.quantity}</td>
                          <td className="px-3 py-2 text-end font-medium">{formatPrice(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(selected.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{formatPrice(selected.delivery_cost)}</span></div>
                  {selected.discount > 0 && <div className="flex justify-between text-secondary"><span>Discount</span><span>-{formatPrice(selected.discount)}</span></div>}
                  <div className="flex justify-between border-t border-border pt-1 font-bold"><span>Total</span><span className="text-primary">{formatPrice(selected.total)}</span></div>
                </div>

                {/* status update */}
                <div>
                  <p className="mb-2 text-sm font-medium">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {ORDER_STATUSES.map((s) => {
                      const allowed = ORDER_STATUS_FLOW[selected.status]?.includes(s) || s === selected.status;
                      return (
                        <Button
                          key={s}
                          size="sm"
                          variant={selected.status === s ? 'default' : 'outline'}
                          disabled={!allowed}
                          onClick={() => updateStatus(selected.id, s)}
                          className="capitalize"
                        >
                          {s}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading…</div>}>
      <OrdersContent />
    </Suspense>
  );
}
