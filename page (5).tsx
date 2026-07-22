'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Banknote, Truck, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { effectivePrice, formatPrice, generateOrderNumber } from '@/lib/format';
import {
  CEDAR_COUNTRIES,
  CEDAR_CITIES,
  CEDAR_DELIVERY_COSTS,
  CEDAR_ESTIMATED_DELIVERY,
} from '@/lib/constants';
import type { Coupon } from '@/lib/types';

export default function CheckoutPage() {
  const { t, locale } = useLanguage();
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const supabase = getSupabaseBrowser();
  const router = useRouter();

  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    country: '',
    city: '',
    area: '',
    street: '',
    building: '',
    notes: '',
  });
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setForm((f) => ({ ...f, customerName: f.customerName || (user.email ?? '') }));
    }
  }, [user]);

  const deliveryCost = form.country ? CEDAR_DELIVERY_COSTS[form.country] ?? 5 : 0;
  const estimatedDelivery = form.country ? CEDAR_ESTIMATED_DELIVERY[form.country] ?? '3-7 business days' : '';
  const discount = coupon
    ? coupon.type === 'percentage'
      ? (subtotal * Number(coupon.value)) / 100
      : Number(coupon.value)
    : 0;
  const total = Math.max(0, subtotal - discount) + deliveryCost;

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponInput.trim().toUpperCase())
      .eq('is_active', true)
      .maybeSingle();
    if (!data) {
      toast.error(locale === 'ar' ? 'رمز غير صالح' : 'Invalid coupon');
      return;
    }
    setCoupon(data as Coupon);
    toast.success(locale === 'ar' ? 'تم تطبيق القسيمة' : 'Coupon applied!');
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) {
      toast.error(locale === 'ar' ? 'السلة فارغة' : 'Cart is empty');
      return;
    }
    if (!form.customerName || !form.phone || !form.country || !form.city || !form.street) {
      toast.error(locale === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }
    setSubmitting(true);
    const orderNumber = generateOrderNumber();
    const orderData = {
      order_number: orderNumber,
      user_id: user?.id ?? null,
      status: 'pending',
      customer_name: form.customerName,
      customer_phone: form.phone,
      country: form.country,
      city: form.city,
      area: form.area,
      street: form.street,
      building: form.building,
      notes: form.notes,
      shipping_address: { ...form },
      subtotal,
      delivery_cost: deliveryCost,
      discount,
      total,
      coupon_code: coupon?.code ?? null,
      estimated_delivery: estimatedDelivery,
      items_count: items.length,
    };
    const { data: order, error } = await supabase.from('orders').insert(orderData).select('*').maybeSingle();
    if (error || !order) {
      toast.error(locale === 'ar' ? 'فشل إنشاء الطلب' : 'Failed to place order');
      setSubmitting(false);
      return;
    }
    // insert order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      product_name: item.product.name,
      product_slug: item.product.slug,
      product_image: item.product.media?.images?.[0] ?? null,
      price: effectivePrice(Number(item.product.price), item.product.discount_percentage),
      quantity: item.quantity,
      total: effectivePrice(Number(item.product.price), item.product.discount_percentage) * item.quantity,
    }));
    await supabase.from('order_items').insert(orderItems);
    // status history
    await supabase.from('order_status_history').insert({ order_id: order.id, status: 'pending', note: 'Order placed' });
    // notification
    if (user) {
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'order',
        title: `Order ${orderNumber} placed`,
        body: `Your order of ${formatPrice(total)} has been received.`,
        link: `/orders`,
      });
    }
    clear();
    toast.success(t('orderPlaced'));
    setSubmitting(false);
    router.push(`/orders?placed=${orderNumber}`);
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">{t('cartEmpty')}</h1>
        <p className="mt-2 text-muted-foreground">{t('cartEmptyDesc')}</p>
        <Button asChild className="mt-6 rounded-full gradient-cedar text-white">
          <a href="/categories">{t('continueShopping')}</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">{t('checkout')}</h1>

      <form onSubmit={placeOrder} className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* form */}
        <div className="space-y-6">
          {/* COD notice */}
          <div className="glass-card flex items-center gap-3 border-l-4 border-l-secondary p-4">
            <Banknote className="h-8 w-8 text-secondary" />
            <div>
              <p className="font-semibold">{t('cashOnDelivery')}</p>
              <p className="text-sm text-muted-foreground">{locale === 'ar' ? 'ادفع نقداً عند وصول طلبك' : 'Pay in cash when your order arrives'}</p>
            </div>
          </div>

          {/* delivery address */}
          <div className="glass-card space-y-4 p-5">
            <h2 className="flex items-center gap-2 font-semibold"><MapPin className="h-5 w-5 text-primary" /> {locale === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">{t('customerName')} *</label>
                <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">{t('phone')} *</label>
                <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="mt-1" placeholder="+971 50 123 4567" />
              </div>
              <div>
                <label className="text-sm font-medium">{t('country')} *</label>
                <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v, city: '' })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder={t('selectCountry')} /></SelectTrigger>
                  <SelectContent>
                    {CEDAR_COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">{t('city')} *</label>
                <Select value={form.city} onValueChange={(v) => setForm({ ...form, city: v })} disabled={!form.country}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder={locale === 'ar' ? 'اختر المدينة' : 'Select city'} /></SelectTrigger>
                  <SelectContent>
                    {(CEDAR_CITIES[form.country] ?? []).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">{t('area')}</label>
                <Input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">{t('street')} *</label>
                <Input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} required className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">{t('building')}</label>
                <Input value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} className="mt-1" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">{t('notes')}</label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="mt-1" placeholder={locale === 'ar' ? 'تعليمات خاصة بالتوصيل...' : 'Special delivery instructions...'} />
              </div>
            </div>
          </div>

          {/* delivery info */}
          {form.country && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card flex items-center gap-3 p-4">
              <Truck className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-medium">{t('estimatedDelivery')}: {estimatedDelivery}</p>
                <p className="text-sm text-muted-foreground">{t('deliveryCost')}: {formatPrice(deliveryCost)}</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="glass-card space-y-4 p-5">
            <h2 className="font-semibold">Order Summary</h2>

            {/* items */}
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {items.map((item) => {
                const price = effectivePrice(Number(item.product.price), item.product.discount_percentage);
                return (
                  <div key={item.product.id} className="flex gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.product.media?.images?.[0]} alt={item.product.name} className="h-12 w-12 rounded object-cover" />
                    <div className="flex-1 text-sm">
                      <p className="line-clamp-1 font-medium">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity} × {formatPrice(price)}</p>
                    </div>
                    <span className="text-sm font-medium">{formatPrice(price * item.quantity)}</span>
                  </div>
                );
              })}
            </div>

            {/* coupon */}
            <div className="flex gap-2 border-t border-border pt-3">
              <Input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder={t('couponCode')} className="h-9" />
              <Button type="button" onClick={applyCoupon} variant="outline" size="sm" className="rounded-full">{t('apply')}</Button>
            </div>

            <div className="space-y-2 border-t border-border pt-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{t('subtotal')}</span><span>{formatPrice(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-secondary"><span>{t('discount')}</span><span>-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">{t('deliveryCost')}</span><span>{formatPrice(deliveryCost)}</span></div>
            </div>
            <div className="flex justify-between border-t border-border pt-3">
              <span className="font-semibold">{t('total')}</span>
              <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
            </div>

            <Button type="submit" disabled={submitting} className="w-full rounded-full gradient-cedar text-white hover:opacity-90">
              {submitting ? <><Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" /> {t('loading')}</> : <><CheckCircle2 className="ltr:mr-2 rtl:ml-2 h-4 w-4" /> {t('placeOrder')}</>}
            </Button>
            <p className="text-center text-xs text-muted-foreground">{t('cashOnDelivery')} • {locale === 'ar' ? 'لا حاجة للدفع الآن' : 'No payment needed now'}</p>
          </div>
        </div>
      </form>
    </div>
  );
}
