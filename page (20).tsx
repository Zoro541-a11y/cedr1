'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/language-context';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const { t, locale } = useLanguage();
  const supabase = getSupabaseBrowser();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success(locale === 'ar' ? 'تم إرسال رابط الإعادة' : 'Reset link sent');
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full">
        <div className="glass-card p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-primary" />
              <h1 className="text-2xl font-bold">{locale === 'ar' ? 'تحقق من بريدك' : 'Check your email'}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{locale === 'ar' ? `أرسلنا رابط إعادة تعيين كلمة المرور إلى ${email}` : `We sent a password reset link to ${email}`}</p>
              <Button asChild variant="outline" className="mt-6 w-full rounded-full"><Link href="/login">{t('backToLogin')}</Link></Button>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold">{t('resetPassword')}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{locale === 'ar' ? 'أدخل بريدك لإرسال رابط الإعادة' : 'Enter your email to receive a reset link'}</p>
              </div>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t('email')}</label>
                  <div className="relative mt-1">
                    <Mail className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="ltr:pl-9 rtl:pr-9" placeholder="you@example.com" />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full rounded-full gradient-cedar text-white hover:opacity-90">
                  {loading ? <><Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" /> {t('loading')}</> : t('sendResetLink')}
                </Button>
              </form>
              <p className="mt-6 text-center">
                <Link href="/login" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                  <ArrowLeft className="h-4 w-4 ltr:rotate-0 rtl:rotate-180" /> {t('backToLogin')}
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
