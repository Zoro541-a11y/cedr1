import { useState, useEffect } from 'react';
import { X, Trash2, Minus, Plus, ShoppingCart, Loader2, Package2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { supabase, DeliverySettings, Product, getProductImage } from '../lib/supabase';
import { toast } from 'sonner';

export function CartDrawer({ open, onClose, onOrderPlaced }: {
  open: boolean;
  onClose: () => void;
  onOrderPlaced: () => void;
}) {
  const { items, removeFromCart, updateQty, clearCart, subtotal } = useCart();
  const { user } = useAuth();
  const { t } = useI18n();
  const [delivery, setDelivery] = useState<DeliverySettings | null>(null);
  const [checkout, setCheckout] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Beirut');
  const [area, setArea] = useState('');
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('delivery_settings').select('*').eq('id', 1).maybeSingle();
      if (data) setDelivery(data as DeliverySettings);
    })();
  }, []);

  useEffect(() => {
    if (user) {
      (async () => {
        const { data } = await supabase.from('profiles').select('full_name, phone').eq('id', user.id).maybeSingle();
        if (data) {
          if (data.full_name) setFullName(data.full_name);
          if (data.phone) setPhone(data.phone);
        }
      })();
    }
  }, [user]);

  const deliveryFee = delivery && delivery.is_active
    ? (subtotal >= Number(delivery.free_delivery_threshold) ? 0 : Number(delivery.delivery_fee))
    : 0;
  const total = subtotal + deliveryFee;

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error(t('signIn')); return; }
    if (!fullName.trim() || !phone.trim() || !street.trim()) {
      toast.error(t('fullName') + ' / ' + t('phone') + ' / ' + t('streetAddress'));
      return;
    }
    setPlacing(true);

    try {
      const orderNumber = `CD-${Date.now().toString().slice(-8)}`;
      const estimatedDelivery = delivery
        ? `${t('estimatedDelivery')}: ${delivery.delivery_time_days} ${t('deliveryTime').replace(' (days)', '')}`
        : null;

      const { data: order, error: orderError } = await supabase.from('orders').insert({
        order_number: orderNumber,
        user_id: user.id,
        status: 'pending',
        customer_name: fullName.trim(),
        customer_phone: phone.trim(),
        country: 'Lebanon',
        city: city.trim(),
        area: area.trim() || null,
        street: street.trim(),
        building: building.trim() || null,
        notes: notes.trim() || null,
        shipping_address: { city, area, street, building },
        subtotal: subtotal,
        delivery_cost: deliveryFee,
        discount: 0,
        total: total,
        coupon_code: null,
        estimated_delivery: estimatedDelivery,
        items_count: items.reduce((s, i) => s + i.quantity, 0),
      }).select().single();

      if (orderError) { toast.error('Failed: ' + orderError.message); setPlacing(false); return; }

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_slug: item.product.slug,
        product_image: getProductImage(item.product as Product),
        price: Number(item.product.price),
        quantity: item.quantity,
        total: Number(item.product.price) * item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) { toast.error('Failed to save order items'); setPlacing(false); return; }

      await supabase.from('order_status_history').insert({
        order_id: order.id,
        status: 'pending',
        note: 'Order placed by customer',
        changed_by: user.id,
      });

      toast.success(`${orderNumber}`);
      clearCart();
      setCheckout(false);
      setPlacing(false);
      onOrderPlaced();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to place order');
      setPlacing(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col bg-white dark:bg-gray-900 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <ShoppingCart className="h-5 w-5 text-primary" />
            {checkout ? t('checkout') : `${t('yourCart')} (${items.length})`}
          </h2>
          <button onClick={() => { setCheckout(false); onClose(); }}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-gray-400">
            <Package2 className="mb-3 h-12 w-12" />
            <p className="text-sm">{t('emptyCart')}</p>
            <button onClick={onClose}
              className="mt-4 btn-primary text-sm">
              {t('continueShopping')}
            </button>
          </div>
        ) : checkout ? (
          <form onSubmit={placeOrder} className="flex flex-1 flex-col overflow-y-auto">
            <div className="flex-1 space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('fullName')} *</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} required
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('phone')} *</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} required
                  placeholder="+961 71 234 567"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('city')} *</label>
                  <input value={city} onChange={(e) => setCity(e.target.value)} required
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('area')}</label>
                  <input value={area} onChange={(e) => setArea(e.target.value)}
                    placeholder="Hamra"
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('streetAddress')} *</label>
                <input value={street} onChange={(e) => setStreet(e.target.value)} required
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('buildingFloor')}</label>
                <input value={building} onChange={(e) => setBuilding(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('notes')}</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                  placeholder={t('deliveryInstructions')}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
                <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">{t('subtotal')}</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('delivery')}</span>
                  <span className="font-medium">{deliveryFee === 0 ? <span className="text-green-600">{t('freeDelivery')}</span> : `$${deliveryFee.toFixed(2)}`}</span>
                </div>
                {delivery && delivery.is_active && subtotal < Number(delivery.free_delivery_threshold) && (
                  <p className="mt-1 text-xs text-gray-400">{t('freeDeliveryThreshold', (Number(delivery.free_delivery_threshold) - subtotal).toFixed(2))}</p>
                )}
                <div className="mt-2 flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                  <span className="font-bold text-gray-900 dark:text-white">{t('total')}</span>
                  <span className="font-bold text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 p-5">
              <button type="submit" disabled={placing}
                className="flex w-full items-center justify-center gap-2 btn-primary disabled:opacity-50">
                {placing ? (<><Loader2 className="h-4 w-4 animate-spin" /> ...</>) : `${t('placeOrder')} — $${total.toFixed(2)}`}
              </button>
              <button type="button" onClick={() => setCheckout(false)}
                className="mt-2 w-full rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                {t('backToCart')}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5">
              {items.map((item) => {
                const img = getProductImage(item.product as Product);
                return (
                  <div key={item.product.id} className="mb-3 flex gap-3 rounded-xl border border-gray-100 dark:border-gray-800 p-3">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-800">
                      {img ? (
                        <img src={img} alt={item.product.name} className="h-full w-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package2 className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <h4 className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-white">{item.product.name}</h4>
                      <p className="text-sm font-bold text-primary">${Number(item.product.price).toFixed(2)}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQty(item.product.id, item.quantity - 1)}
                            className="rounded-md border border-gray-200 dark:border-gray-700 p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateQty(item.product.id, item.quantity + 1)}
                            className="rounded-md border border-gray-200 dark:border-gray-700 p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.product.id)}
                          className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 p-5">
              <div className="mb-3 flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{t('subtotal')}</span>
                <span className="font-bold text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>
              {delivery && delivery.is_active && (
                <p className="mb-3 text-xs text-gray-400">
                  {subtotal >= Number(delivery.free_delivery_threshold)
                    ? t('youGetFreeDelivery')
                    : t('freeDeliveryThreshold', (Number(delivery.free_delivery_threshold) - subtotal).toFixed(2))}
                </p>
              )}
              <button onClick={() => setCheckout(true)}
                className="w-full btn-primary">
                {t('checkout')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
