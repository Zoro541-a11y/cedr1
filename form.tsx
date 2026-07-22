'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { useAuth } from '@/lib/auth-context';
import { timeAgo } from '@/lib/format';
import type { Notification } from '@/lib/types';
import { toast } from 'sonner';

export default function AdminNotificationsPage() {
  const supabase = getSupabaseBrowser();
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) { toast.error(error.message); setLoading(false); return; }
      setItems((data ?? []) as Notification[]);
      setLoading(false);
    })();
  }, [user, supabase]);

  const markRead = async (id: string) => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) { toast.error('Failed'); return; }
    setItems((p) => p.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllRead = async () => {
    if (!user) return;
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    if (error) { toast.error('Failed'); return; }
    setItems((p) => p.map((n) => ({ ...n, is_read: true })));
    toast.success('All marked read');
  };

  const unreadCount = items.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && <Button size="sm" variant="outline" onClick={markAllRead}><CheckCheck className="ltr:mr-2 rtl:ml-2 h-4 w-4" /> Mark all read</Button>}
      </div>

      {loading && <div className="flex h-40 items-center justify-center text-muted-foreground">Loading…</div>}

      {!loading && items.length === 0 && (
        <Card><CardContent className="flex flex-col items-center justify-center gap-2 p-12 text-muted-foreground">
          <Bell className="h-10 w-10 opacity-40" />
          <p>No notifications</p>
        </CardContent></Card>
      )}

      <div className="space-y-2">
        {items.map((n) => (
          <Card key={n.id} className={n.is_read ? 'opacity-60' : 'border-primary/30'}>
            <CardContent className="flex items-start gap-3 p-4">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${n.is_read ? 'bg-muted' : 'bg-primary/10 text-primary'}`}>
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{n.title}</p>
                  {!n.is_read && <Badge className="text-[10px]">New</Badge>}
                </div>
                {n.body && <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.created_at)}</p>
              </div>
              {!n.is_read && <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => markRead(n.id)}><Check className="h-3.5 w-3.5" /></Button>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
