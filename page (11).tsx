'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/lib/cart-context';
import { useLanguage } from '@/lib/language-context';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { effectivePrice, formatPrice } from '@/lib/format';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Coupon } from '@/lib/types';

export default function CartPage() {
  const { t, locale } = useLanguage();
  const { items, subtotal, removeItem, updateQty, clear } = useCart();
  const supabase = getSupabaseBrowser();
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  const applyCoupon = async () => {
    setCouponError('');
    if (!couponInput.trim()) return;
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponInput.trim().toUpperCase())
      .eq('is_active', true)
      .maybeSingle();
    if (!data) {
      setCouponError(locale === 'ar' ? 'رمز القسيمة غير صالح' : 'Invalid coupon code');
      setCoupon(null);
      return;
    }
    const c = data as Coupon;
    if (c.min_order && subtotal < Number(c.min_order)) {
      setCouponError(locale === 'ar' ? `الحد الأدنى للطلب ${c.min_order}` : `Minimum order is ${c.min_order}`);
      return;
    }
    setCoupon(c);
    toast.success(locale === 'ar' ? 'تم تطبيق القسيمة' : 'Coupon applied!');
  };

  const discount = coupon
    ? coupon.type === 'percentage'
      ? (subtotal * Number(coupon.value)) / 100
      : Number(coupon.value)
    : 0;
  const total = Math.max(0, subtotal - discount);

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
        <div className="glass-card mb-6 flex h-24 w-24 items-center justify-center rounded-full">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">{t('cartEmpty')}</h1>
        <p className="mt-2 text-muted-foreground">{t('cartEmptyDesc')}</p>
        <Button asChild className="mt-6 rounded-full gradient-cedar text-white">
          <Link href="/categories">{t('continueShopping')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
        {t('cart')} <span className="text-base font-normal text-muted-foreground">({items.length})</span>
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* items */}
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item) => {
              const price = effectivePrice(Number(item.product.price), item.product.discount_percentage);
              return (
                <motion.div
                  key={item.product.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card flex gap-4 p-4"
                >
                  <Link href={`/product/${item.product.slug}`} className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.product.media?.images?.[0]} alt={item.product.name} className="h-20 w-20 rounded-lg object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <Link href={`/product/${item.product.slug}`} className="line-clamp-2 text-sm font-medium hover:text-primary">{item.product.name}</Link>
                    {item.product.brand && <p className="text-xs text-muted-foreground">{item.product.brand.name}</p>}
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-border">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQty(item.product.id, item.quantity - 1)}><Minus className="h-3.5 w-3.5" /></Button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQty(item.product.id, item.quantity + 1)}><Plus className="h-3.5 w-3.5" /></Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary">{formatPrice(price * item.quantity)}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.product.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div className="flex justify-between">
            <Button variant="ghost" size="sm" onClick={clear} className="text-muted-foreground">{locale === 'ar' ? 'إفراغ السلة' : 'Clear cart'}</Button>
            <Button asChild variant="ghost" size="sm"><Link href="/categories">{t('continueShopping')}</Link></Button>
          </div>
        </div>

        {/* summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="glass-card space-y-4 p-5">
            <h2 className="font-semibold">Order Summary</h2>

            {/* coupon */}
            <div>
              <label className="text-sm font-medium">{t('couponCode')}</label>
              <div className="mt-1 flex gap-2">
                <div className="relative flex-1">
                  <Tag className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3" />
                  <Input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="CEDAR10" className="ltr:pl-9 rtl:pr-9" />
                </div>
                <Button onClick={applyCoupon} variant="outline" className="rounded-full">{t('apply')}</Button>
              </div>
              {couponError && <p className="mt-1 text-xs text-destructive">{couponError}</p>}
              {coupon && <Badge className="mt-1 bg-primary text-primary-foreground">{coupon.code} applied</Badge>}
            </div>

            <div className="space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{t('subtotal')}</span><span className="font-medium">{formatPrice(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-secondary"><span>{t('discount')}</span><span>-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between text-muted-foreground"><span>{t('deliveryCost')}</span><span>{locale === 'ar' ? 'يُحسب عند الدفع' : 'Calculated at checkout'}</span></div>
            </div>
            <div className="flex justify-between border-t border-border pt-4">
              <span className="font-semibold">{t('total')}</span>
              <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
            </div>

            <Button asChild className="w-full rounded-full gradient-cedar text-white hover:opacity-90">
              <Link href="/checkout">{t('proceedToCheckout')} <ArrowRight className="ltr:ml-2 rtl:mr-2 rtl:rotate-180 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
