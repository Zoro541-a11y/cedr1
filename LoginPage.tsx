import { useEffect, useState, useCallback } from 'react';
import { Package, ChevronDown, ChevronRight, ShoppingBag, Clock, MapPin, Truck, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase, Order, OrderItem, OrderStatus, STATUS_LABELS, STATUS_COLORS, ORDER_STATUSES } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { toast } from 'sonner';

const STATUS_ICONS: Record<OrderStatus, typeof Clock> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Loader2,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  refunded: Package,
};

const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export function MyOrdersPage({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) { toast.error('Failed to load orders'); }
    else { setOrders((data ?? []) as Order[]); }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const loadItems = async (orderId: string) => {
    setLoadingItems(true);
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    if (error) { toast.error('Failed to load order items'); }
    else { setOrderItems((data ?? []) as OrderItem[]); }
    setLoadingItems(false);
  };

  const toggleExpand = (orderId: string) => {
    if (expandedId === orderId) {
      setExpandedId(null);
    } else {
      setExpandedId(orderId);
      loadItems(orderId);
    }
  };

  const getStatusStep = (status: OrderStatus): number => {
    const idx = STATUS_STEPS.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        <ShoppingBag className="h-8 w-8 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 animate-fade-in">
      <button onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary transition">
        <ChevronRight className="h-4 w-4 rotate-180 rtl:rotate-0" /> {t('home')}
      </button>

      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">{t('myOrders')}</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 py-16 text-gray-400">
          <ShoppingBag className="mb-3 h-12 w-12" />
          <p className="text-base font-medium">{t('noOrders')}</p>
          <p className="text-sm">{t('noOrdersDesc')}</p>
          <button onClick={onBack}
            className="mt-4 btn-primary text-sm">
            {t('shopNow')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const Icon = STATUS_ICONS[order.status];
            const currentStep = getStatusStep(order.status);
            const isCancelled = order.status === 'cancelled' || order.status === 'refunded';

            return (
              <div key={order.id} className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <button onClick={() => toggleExpand(order.id)}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  {expandedId === order.id ? (
                    <ChevronDown className="h-5 w-5 flex-shrink-0 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400 rtl:rotate-180" />
                  )}
                  <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{order.order_number}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`status-badge ${STATUS_COLORS[order.status]}`}>
                        <Icon className="h-3 w-3" />
                        {STATUS_LABELS[order.status]}
                      </span>
                      <span className="font-bold text-primary">${Number(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                </button>

                {expandedId === order.id && (
                  <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50 p-5">
                    {/* Status tracker */}
                    {!isCancelled && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between">
                          {STATUS_STEPS.map((step, i) => {
                            const isDone = i <= currentStep;
                            const StepIcon = STATUS_ICONS[step];
                            return (
                              <div key={step} className="flex flex-1 flex-col items-center gap-1">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                                  isDone ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                }`}>
                                  <StepIcon className="h-4 w-4" />
                                </div>
                                <span className={`text-[10px] font-medium ${isDone ? 'text-primary' : 'text-gray-400'}`}>
                                  {STATUS_LABELS[step]}
                                </span>
                                {i < STATUS_STEPS.length - 1 && (
                                  <div className={`absolute h-0.5 ${isDone ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                                    style={{ width: '20%', marginLeft: '5rem' }} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {loadingItems ? (
                      <div className="flex justify-center py-4 text-gray-400">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      </div>
                    ) : (
                      <>
                        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="rounded-xl bg-white dark:bg-gray-900 p-4">
                            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-400">
                              <MapPin className="h-3.5 w-3.5" /> {t('shippingAddress')}
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{order.customer_name}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{order.customer_phone}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{order.street}{order.building ? `, ${order.building}` : ''}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{order.area ? `${order.area}, ` : ''}{order.city}, {order.country}</p>
                            {order.notes && <p className="mt-1 text-xs text-gray-500">{t('notes')}: {order.notes}</p>}
                          </div>
                          <div className="rounded-xl bg-white dark:bg-gray-900 p-4">
                            <h4 className="mb-2 text-xs font-semibold uppercase text-gray-400">{t('orderSummary')}</h4>
                            <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">{t('subtotal')}</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">{t('delivery')}</span><span>${Number(order.delivery_cost).toFixed(2)}</span></div>
                            <div className="mt-1 flex justify-between border-t border-gray-100 dark:border-gray-800 pt-1 font-bold"><span>{t('total')}</span><span className="text-primary">${Number(order.total).toFixed(2)}</span></div>
                            {order.estimated_delivery && <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500"><Clock className="h-3 w-3" /> {order.estimated_delivery}</p>}
                          </div>
                        </div>

                        <h4 className="mb-2 text-xs font-semibold uppercase text-gray-400">{t('orderItems')} ({orderItems.length})</h4>
                        <div className="space-y-2">
                          {orderItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 rounded-xl bg-white dark:bg-gray-900 p-3">
                              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                {item.product_image ? (
                                  <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                ) : (
                                  <div className="flex h-full items-center justify-center"><Package className="h-5 w-5 text-gray-300 dark:text-gray-600" /></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.product_name}</p>
                                <p className="text-xs text-gray-400">${Number(item.price).toFixed(2)} x {item.quantity}</p>
                              </div>
                              <p className="font-medium text-gray-900 dark:text-white">${Number(item.total).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
