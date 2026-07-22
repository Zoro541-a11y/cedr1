'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { toast } from 'sonner';

export default function LoginPage() {
  const { t, locale } = useLanguage();
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(locale === 'ar' ? 'تم تسجيل الدخول' : 'Signed in successfully');
    router.push('/');
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full">
        <div className="glass-card p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl gradient-cedar text-white">
              <span className="text-2xl font-bold">C</span>
            </div>
            <h1 className="text-2xl font-bold">{t('signIn')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('tagline')}</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('email')}</label>
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="ltr:pl-9 rtl:pr-9" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t('password')}</label>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3" />
                <Input type={showPwd ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="ltr:pl-9 ltr:pr-9 rtl:pr-9 rtl:pl-9" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute top-1/2 -translate-y-1/2 text-muted-foreground ltr:right-3 rtl:left-3">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">{t('forgotPassword')}</Link>
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-full gradient-cedar text-white hover:opacity-90">
              {loading ? <><Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" /> {t('loading')}</> : t('signIn')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('dontHaveAccount')} <Link href="/register" className="font-medium text-primary hover:underline">{t('register')}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
