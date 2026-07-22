import { useEffect, useState, useCallback } from 'react';
import { Package, ChevronDown, ChevronRight, Search, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, Order, OrderItem, OrderStatus, ORDER_STATUSES, STATUS_LABELS, STATUS_COLORS } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function OrdersAdmin() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { toast.error('Failed to load orders'); }
    else { setOrders((data ?? []) as Order[]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search);
    return matchStatus && matchSearch;
  });

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const loadItems = async (orderId: string) => {
    setLoadingItems(true);
    const { data, error } = await supabase.from('order_items').select('*').eq('order_id', orderId);
    if (error) { toast.error('Failed to load order items'); }
    else { setOrderItems((data ?? []) as OrderItem[]); }
    setLoadingItems(false);
  };

  const toggleExpand = (orderId: string) => {
    if (expandedId === orderId) { setExpandedId(null); }
    else { setExpandedId(orderId); loadItems(orderId); }
  };

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    const { error } = await supabase.from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', orderId);
    if (error) { toast.error('Failed to update status'); }
    else {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      if (user) {
        await supabase.from('order_status_history').insert({
          order_id: orderId, status: newStatus, changed_by: user.id,
          note: `Status changed to ${STATUS_LABELS[newStatus]}`,
        });
      }
      toast.success(`${STATUS_LABELS[newStatus]}`);
    }
    setUpdatingId(null);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Orders</h2>
        <div className="flex flex-1 gap-2 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, name, phone..."
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-2 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'all')}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="all">All Status</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]} ({statusCounts[s] ?? 0})</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-gray-400">
          <ClipboardList className="h-8 w-8 animate-pulse" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 dark:border-gray-700 py-16 text-gray-400">
          <ClipboardList className="mb-2 h-10 w-10" />
          <p className="text-sm">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div key={order.id} className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <button onClick={() => toggleExpand(order.id)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50">
                {expandedId === order.id ? <ChevronDown className="h-5 w-5 flex-shrink-0 text-gray-400" /> : <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400 rtl:rotate-180" />}
                <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{order.order_number}</p>
                    <p className="text-xs text-gray-400">{order.customer_name} · {order.customer_phone} · {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`status-badge ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                    <span className="font-bold text-primary">${Number(order.total).toFixed(2)}</span>
                    <span className="text-xs text-gray-400">{order.items_count} items</span>
                  </div>
                </div>
              </button>

              {expandedId === order.id && (
                <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50 p-4">
                  {loadingItems ? (
                    <div className="flex justify-center py-4 text-gray-400">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-white dark:bg-gray-900 p-3">
                          <h4 className="mb-2 text-xs font-semibold uppercase text-gray-400">Shipping Address</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{order.customer_name}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{order.customer_phone}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{order.street}{order.building ? `, ${order.building}` : ''}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{order.area ? `${order.area}, ` : ''}{order.city}, {order.country}</p>
                          {order.notes && <p className="mt-1 text-xs text-gray-500">Notes: {order.notes}</p>}
                        </div>
                        <div className="rounded-lg bg-white dark:bg-gray-900 p-3">
                          <h4 className="mb-2 text-xs font-semibold uppercase text-gray-400">Order Summary</h4>
                          <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">Delivery</span><span>${Number(order.delivery_cost).toFixed(2)}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">Discount</span><span>-${Number(order.discount).toFixed(2)}</span></div>
                          <div className="mt-1 flex justify-between border-t border-gray-100 dark:border-gray-800 pt-1 font-bold"><span>Total</span><span className="text-primary">${Number(order.total).toFixed(2)}</span></div>
                          {order.estimated_delivery && <p className="mt-2 text-xs text-gray-500">{order.estimated_delivery}</p>}
                        </div>
                      </div>

                      <h4 className="mb-2 text-xs font-semibold uppercase text-gray-400">Items ({orderItems.length})</h4>
                      <div className="mb-4 space-y-2">
                        {orderItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 rounded-lg bg-white dark:bg-gray-900 p-3">
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

                      <div className="flex flex-col gap-2 border-t border-gray-100 dark:border-gray-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Update Status:</span>
                        <div className="flex flex-wrap gap-2">
                          {ORDER_STATUSES.map((s) => (
                            <button key={s} onClick={() => updateStatus(order.id, s)}
                              disabled={updatingId === order.id || order.status === s}
                              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-30 ${
                                order.status === s ? STATUS_COLORS[s] : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}>
                              {updatingId === order.id ? '...' : STATUS_LABELS[s]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
