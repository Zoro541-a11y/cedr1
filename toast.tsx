'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { toast } from 'sonner';

export default function RegisterPage() {
  const { t, locale } = useLanguage();
  const { signUp } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error(locale === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error(locale === 'ar' ? 'كلمة المرور قصيرة جداً' : 'Password too short (min 6)');
      return;
    }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.fullName);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    setDone(true);
    toast.success(locale === 'ar' ? 'تم إنشاء الحساب' : 'Account created');
  };

  if (done) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-primary" />
          <h1 className="text-2xl font-bold">{locale === 'ar' ? 'تم إنشاء حسابك!' : 'Account created!'}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{locale === 'ar' ? 'يمكنك الآن تسجيل الدخول والبدء بالتسوق.' : 'You can now sign in and start shopping.'}</p>
          <Button asChild className="mt-6 w-full rounded-full gradient-cedar text-white"><Link href="/login">{t('signIn')}</Link></Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full">
        <div className="glass-card p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl gradient-cedar text-white">
              <span className="text-2xl font-bold">C</span>
            </div>
            <h1 className="text-2xl font-bold">{t('createAccount')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('tagline')}</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('fullName')}</label>
              <div className="relative mt-1">
                <User className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3" />
                <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required className="ltr:pl-9 rtl:pr-9" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t('email')}</label>
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3" />
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="ltr:pl-9 rtl:pr-9" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t('password')}</label>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3" />
                <Input type={showPwd ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="ltr:pl-9 ltr:pr-9 rtl:pr-9 rtl:pl-9" />
                <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute top-1/2 -translate-y-1/2 text-muted-foreground ltr:right-3 rtl:left-3">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t('confirmPassword')}</label>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3" />
                <Input type={showPwd ? 'text' : 'password'} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required className="ltr:pl-9 rtl:pr-9" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-full gradient-cedar text-white hover:opacity-90">
              {loading ? <><Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" /> {t('loading')}</> : t('createAccount')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('haveAccount')} <Link href="/login" className="font-medium text-primary hover:underline">{t('signIn')}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
