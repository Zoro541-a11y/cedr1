'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { timeAgo } from '@/lib/format';
import type { Notification } from '@/lib/types';

export default function NotificationsPage() {
  const { t, locale } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const supabase = getSupabaseBrowser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) {
      if (!authLoading) setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setNotifications((data ?? []) as Notification[]);
      setLoading(false);
    })();
  }, [user, authLoading, supabase]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications((p) => p.map((n) => ({ ...n, is_read: true })));
  };

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications((p) => p.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  if (authLoading || loading) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">{t('loading')}</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">{locale === 'ar' ? 'سجّل الدخول لعرض الإشعارات' : 'Sign in to view notifications'}</h1>
        <Button asChild className="mt-6 rounded-full gradient-cedar text-white"><Link href="/login">{t('login')}</Link></Button>
      </div>
    );
  }

  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {t('notifications')} {unread > 0 && <span className="text-base font-normal text-destructive">({unread} new)</span>}
        </h1>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="rounded-full">
            <CheckCheck className="ltr:mr-2 rtl:ml-2 h-4 w-4" /> {locale === 'ar' ? 'تعليم الكل كمقروء' : 'Mark all read'}
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <Bell className="mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">{locale === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`glass-card flex items-start gap-3 p-4 transition-all ${n.is_read ? 'opacity-60' : 'border-l-4 border-l-primary'}`}
              onClick={() => markRead(n.id)}
            >
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${n.is_read ? 'bg-muted' : 'gradient-cedar text-white'}`}>
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{n.title}</p>
                {n.body && <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>}
                {n.link && <Link href={n.link} className="mt-1 inline-block text-xs text-primary hover:underline">{n.link}</Link>}
                <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.created_at)}</p>
              </div>
              {!n.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
