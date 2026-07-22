'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Ban, CheckCircle2, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { formatDateTime } from '@/lib/format';
import type { Profile, Order, Address } from '@/lib/types';
import { toast } from 'sonner';

export default function AdminCustomersPage() {
  const supabase = getSupabaseBrowser();
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<{ profile: Profile; orders: Order[]; addresses: Address[] } | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setCustomers((data ?? []) as Profile[]);
      setLoading(false);
    })();
  }, [supabase]);

  const filtered = customers.filter((c) =>
    (c.full_name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const viewCustomer = async (p: Profile) => {
    const [{ data: orders }, { data: addresses }] = await Promise.all([
      supabase.from('orders').select('*').eq('user_id', p.id).order('created_at', { ascending: false }),
      supabase.from('addresses').select('*').eq('user_id', p.id),
    ]);
    setSelected({ profile: p, orders: (orders ?? []) as Order[], addresses: (addresses ?? []) as Address[] });
  };

  const toggleBlock = async (p: Profile) => {
    const newBlocked = !p.is_blocked;
    await supabase.from('profiles').update({ is_blocked: newBlocked }).eq('id', p.id);
    setCustomers((prev) => prev.map((c) => (c.id === p.id ? { ...c, is_blocked: newBlocked } : c)));
    toast.success(newBlocked ? 'User blocked' : 'User unblocked');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">{customers.length} customers</p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name..." className="ltr:pl-9 rtl:pr-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">Customer</th>
                  <th className="px-4 py-3 text-start font-medium">Role</th>
                  <th className="px-4 py-3 text-start font-medium">Joined</th>
                  <th className="px-4 py-3 text-start font-medium">Status</th>
                  <th className="px-4 py-3 text-end font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">Loading…</td></tr>
                ) : filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-gold text-xs font-bold text-white">{(c.full_name || 'U').charAt(0).toUpperCase()}</div>
                        <div><p className="font-medium">{c.full_name || 'Unknown'}</p><p className="text-xs text-muted-foreground">{c.phone || '—'}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant={c.role === 'customer' ? 'secondary' : 'default'} className="capitalize">{c.role.replace('_', ' ')}</Badge></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTime(c.created_at)}</td>
                    <td className="px-4 py-3"><Badge variant={c.is_blocked ? 'destructive' : 'outline'}>{c.is_blocked ? 'Blocked' : 'Active'}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => viewCustomer(c)}><Eye className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className={`h-8 w-8 ${c.is_blocked ? 'text-green-600' : 'text-destructive'}`} onClick={() => toggleBlock(c)}>{c.is_blocked ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader><DialogTitle>{selected.profile.full_name || 'Customer'}</DialogTitle></DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {selected.profile.id}</div>
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {selected.profile.phone || '—'}</div>
                </div>
                <div>
                  <p className="mb-2 font-medium">Orders ({selected.orders.length})</p>
                  <div className="space-y-1">
                    {selected.orders.length === 0 && <p className="text-muted-foreground">No orders</p>}
                    {selected.orders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between rounded-lg border border-border p-2">
                        <span className="font-mono text-xs">{o.order_number}</span>
                        <Badge>{o.status}</Badge>
                        <span className="font-medium">${o.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 font-medium">Addresses ({selected.addresses.length})</p>
                  <div className="space-y-1">
                    {selected.addresses.length === 0 && <p className="text-muted-foreground">No saved addresses</p>}
                    {selected.addresses.map((a) => (
                      <div key={a.id} className="flex items-start gap-2 rounded-lg border border-border p-2">
                        <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <span>{a.street}, {a.city}, {a.country}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
