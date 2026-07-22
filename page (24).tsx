'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, CheckCircle2, Clock, Truck, XCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { formatPrice, formatDateTime } from '@/lib/format';
import type { Order, OrderStatus } from '@/lib/types';

const statusConfig: Record<OrderStatus, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: 'bg-amber-500', label: 'Pending' },
  confirmed: { icon: CheckCircle2, color: 'bg-blue-500', label: 'Confirmed' },
  preparing: { icon: Package, color: 'bg-purple-500', label: 'Preparing' },
  shipped: { icon: Truck, color: 'bg-indigo-500', label: 'Shipped' },
  delivered: { icon: CheckCircle2, color: 'bg-green-500', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'bg-red-500', label: 'Cancelled' },
  returned: { icon: Package, color: 'bg-gray-500', label: 'Returned' },
};

function OrdersContent() {
  const { t, locale } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const supabase = getSupabaseBrowser();
  const searchParams = useSearchParams();
  const placedOrder = searchParams.get('placed');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders((data ?? []) as Order[]);
      setLoading(false);
    })();
  }, [user, authLoading, supabase]);

  if (authLoading || loading) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted-foreground">{t('loading')}</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">{locale === 'ar' ? 'سجّل الدخول لعرض طلباتك' : 'Sign in to view your orders'}</h1>
        <Button asChild className="mt-6 rounded-full gradient-cedar text-white"><Link href="/login">{t('login')}</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">{t('orders')}</h1>

      {placedOrder && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card mb-6 flex items-center gap-3 border-l-4 border-l-primary p-4">
          <CheckCircle2 className="h-8 w-8 text-primary" />
          <div>
            <p className="font-semibold">{t('orderPlaced')}</p>
            <p className="text-sm text-muted-foreground">{locale === 'ar' ? 'رقم الطلب' : 'Order number'}: <span className="font-mono font-medium">{placedOrder}</span></p>
          </div>
        </motion.div>
      )}

      {orders.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <Package className="mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">{locale === 'ar' ? 'لا توجد طلبات بعد' : 'No orders yet'}</p>
          <Button asChild className="mt-4 rounded-full gradient-cedar text-white"><Link href="/categories">{t('continueShopping')}</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => {
            const cfg = statusConfig[order.status];
            const StatusIcon = cfg.icon;
            return (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.3) }} className="glass-card overflow-hidden">
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${cfg.color} text-white`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${cfg.color} text-white`}>{cfg.label}</Badge>
                    <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                  </div>
                </div>

                {/* tracking */}
                <div className="border-t border-border/60 px-4 py-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">{locale === 'ar' ? 'تتبع الطلب' : 'Order tracking'}</p>
                  <div className="flex items-center gap-1">
                    {['pending', 'confirmed', 'preparing', 'shipped', 'delivered'].map((s, idx) => {
                      const order2 = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered'];
                      const reached = order2.indexOf(order.status) >= idx;
                      return (
                        <div key={s} className="flex flex-1 items-center">
                          <div className={`h-2 flex-1 rounded-full ${reached ? 'bg-primary' : 'bg-muted'}`} />
                          {idx < 4 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                    <span>Pending</span><span>Confirmed</span><span>Preparing</span><span>Shipped</span><span>Delivered</span>
                  </div>
                </div>

                {/* items */}
                {order.order_items && order.order_items.length > 0 && (
                  <div className="border-t border-border/60 px-4 py-3">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex shrink-0 items-center gap-2 rounded-lg bg-muted/30 p-2">
                          {item.product_image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.product_image} alt={item.product_name} className="h-10 w-10 rounded object-cover" />
                          )}
                          <div className="text-xs">
                            <p className="line-clamp-1 font-medium">{item.product_name}</p>
                            <p className="text-muted-foreground">×{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted-foreground">Loading…</div>}>
      <OrdersContent />
    </Suspense>
  );
}
