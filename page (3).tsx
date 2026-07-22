'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Package, Heart, Bell, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { toast } from 'sonner';
import Link from 'next/link';
import type { Address } from '@/lib/types';
import { CEDAR_COUNTRIES } from '@/lib/constants';

export default function ProfilePage() {
  const { t, locale } = useLanguage();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const supabase = getSupabaseBrowser();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [saving, setSaving] = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ full_name: '', phone: '', country: '', city: '', street: '', area: '', building: '', notes: '', is_default: false });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setAddresses((data ?? []) as Address[]);
    })();
  }, [user, supabase]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', user.id);
    await refreshProfile();
    toast.success(locale === 'ar' ? 'تم حفظ الملف' : 'Profile saved');
    setSaving(false);
  };

  const addAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { data } = await supabase
      .from('addresses')
      .insert({ ...addrForm, user_id: user.id })
      .select('*')
      .maybeSingle();
    if (data) {
      setAddresses((p) => [data as Address, ...p]);
      setAddrForm({ full_name: '', phone: '', country: '', city: '', street: '', area: '', building: '', notes: '', is_default: false });
      setShowAddrForm(false);
      toast.success(locale === 'ar' ? 'تمت إضافة العنوان' : 'Address added');
    }
  };

  const deleteAddress = async (id: string) => {
    await supabase.from('addresses').delete().eq('id', id);
    setAddresses((p) => p.filter((a) => a.id !== id));
  };

  if (!user) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">{locale === 'ar' ? 'سجّل الدخول لعرض ملفك' : 'Sign in to view your profile'}</h1>
        <Button asChild className="mt-6 rounded-full gradient-cedar text-white"><Link href="/login">{t('login')}</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">{t('profile')}</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {/* sidebar */}
        <div className="space-y-3">
          <div className="glass-card flex items-center gap-3 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-gold text-xl font-bold text-white">
              {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{profile?.full_name || user.email}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <nav className="glass-card space-y-1 p-2">
            {[
              { icon: User, label: t('profile'), active: true },
              { icon: Package, label: t('orders'), href: '/orders' },
              { icon: Heart, label: t('wishlist'), href: '/wishlist' },
              { icon: Bell, label: t('notifications'), href: '/notifications' },
            ].map((item, i) => (
              <Link key={i} href={item.href ?? '#'} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${item.active ? 'bg-accent font-medium text-primary' : 'hover:bg-accent'}`}>
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            ))}
            <button onClick={() => signOut()} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-accent">
              <LogOut className="h-4 w-4" /> {t('logout')}
            </button>
          </nav>
        </div>

        {/* main */}
        <div className="space-y-6 md:col-span-2">
          {/* profile form */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> {locale === 'ar' ? 'معلومات الحساب' : 'Account Information'}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={saveProfile} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t('fullName')}</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('email')}</label>
                  <Input value={user.email ?? ''} disabled className="mt-1 bg-muted/50" />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('phone')}</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" placeholder="+971 50 123 4567" />
                </div>
                <Button type="submit" disabled={saving} className="rounded-full gradient-cedar text-white">{saving ? t('loading') : locale === 'ar' ? 'حفظ' : 'Save'}</Button>
              </form>
            </CardContent>
          </Card>

          {/* addresses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> {locale === 'ar' ? 'العناوين' : 'Addresses'}</span>
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => setShowAddrForm((s) => !s)}>{locale === 'ar' ? 'إضافة' : 'Add'}</Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {showAddrForm && (
                <form onSubmit={addAddress} className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-2">
                  <Input placeholder={t('fullName')} value={addrForm.full_name} onChange={(e) => setAddrForm({ ...addrForm, full_name: e.target.value })} required />
                  <Input placeholder={t('phone')} value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} required />
                  <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={addrForm.country} onChange={(e) => setAddrForm({ ...addrForm, country: e.target.value })} required>
                    <option value="">{t('selectCountry')}</option>
                    {CEDAR_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <Input placeholder={t('city')} value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} required />
                  <Input placeholder={t('street')} value={addrForm.street} onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })} required />
                  <Input placeholder={t('area')} value={addrForm.area} onChange={(e) => setAddrForm({ ...addrForm, area: e.target.value })} />
                  <Input placeholder={t('building')} value={addrForm.building} onChange={(e) => setAddrForm({ ...addrForm, building: e.target.value })} />
                  <Button type="submit" size="sm" className="rounded-full gradient-cedar text-white">{locale === 'ar' ? 'حفظ العنوان' : 'Save address'}</Button>
                </form>
              )}
              {addresses.length === 0 && !showAddrForm && (
                <p className="text-sm text-muted-foreground">{locale === 'ar' ? 'لا توجد عناوين محفوظة' : 'No saved addresses'}</p>
              )}
              {addresses.map((a) => (
                <div key={a.id} className="flex items-start justify-between rounded-lg border border-border p-3">
                  <div className="text-sm">
                    <p className="font-medium">{a.full_name} {a.is_default && <span className="text-xs text-primary">({locale === 'ar' ? 'افتراضي' : 'Default'})</span>}</p>
                    <p className="text-muted-foreground">{a.street}, {a.city}, {a.country}</p>
                    <p className="text-muted-foreground">{a.phone}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteAddress(a.id)}>Delete</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* security note */}
          <div className="glass-card flex items-center gap-3 p-4 text-sm">
            <Shield className="h-5 w-5 text-primary" />
            <p className="text-muted-foreground">{locale === 'ar' ? 'بياناتك محمية بأمانenterprise مع التحقق عبر Supabase Auth.' : 'Your data is protected with enterprise-grade security via Supabase Auth.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
