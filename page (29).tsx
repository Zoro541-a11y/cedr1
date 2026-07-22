'use client';

import { useState, useEffect } from 'react';
import { Save, UserPlus, Trash2, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { useAuth } from '@/lib/auth-context';
import { CEDAR_ROLES } from '@/lib/constants';
import { formatDateTime } from '@/lib/format';
import { toast } from 'sonner';
import type { Profile, AdminRole } from '@/lib/types';

export default function AdminSettingsPage() {
  const supabase = getSupabaseBrowser();
  const { user, profile, refreshProfile } = useAuth();
  const [admins, setAdmins] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('support');
  const [savingProfile, setSavingProfile] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '' });

  useEffect(() => {
    if (profile) {
      setProfileForm({ full_name: profile.full_name ?? '', phone: profile.phone ?? '' });
    }
  }, [profile]);

  useEffect(() => {
    (async () => {
      const [{ data: a }, { data: r }] = await Promise.all([
        supabase.from('profiles').select('*').neq('role', 'customer').order('created_at', { ascending: false }),
        supabase.from('admin_roles').select('*').order('name', { ascending: true }),
      ]);
      setAdmins((a ?? []) as unknown as Profile[]);
      setRoles((r ?? []) as unknown as AdminRole[]);
    })();
  }, [supabase]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').update({
      full_name: profileForm.full_name,
      phone: profileForm.phone,
    }).eq('id', user.id);
    if (error) { toast.error(error.message); setSavingProfile(false); return; }
    await refreshProfile();
    toast.success('Profile updated');
    setSavingProfile(false);
  };

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: inviteEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/register?role=${inviteRole}&email=${encodeURIComponent(inviteEmail)}`,
        data: { invited_role: inviteRole },
      },
    });
    if (error) { toast.error(error.message); setInviting(false); return; }
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
    setInviting(false);
  };

  const updateAdminRole = async (id: string, role: string) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    setAdmins((p) => p.map((a) => (a.id === id ? { ...a, role: role as Profile['role'] } : a)));
    toast.success('Role updated');
  };

  const removeAdmin = async (id: string) => {
    const { error } = await supabase.from('profiles').update({ role: 'customer' }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    setAdmins((p) => p.filter((a) => a.id !== id));
    toast.success('Admin access revoked');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile & team</p>
      </div>

      <Card>
        <CardHeader><CardTitle>My Profile</CardTitle><CardDescription>Update your personal information</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
            <div><Label>Full Name</Label><Input value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} /></div>
            <div className="sm:col-span-2"><Button type="submit" disabled={savingProfile} className="gradient-cedar text-white"><Save className="ltr:mr-2 rtl:ml-2 h-4 w-4" /> Save Profile</Button></div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Invite Team Member</CardTitle><CardDescription>Send an invitation to join as an admin</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={invite} className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2"><Label>Email *</Label><Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required placeholder="newadmin@cedar.com" /></div>
            <div>
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CEDAR_ROLES.filter((r) => r !== 'super_admin').map((r) => <SelectItem key={r} value={r}>{r.replace(/_/g, ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-3"><Button type="submit" disabled={inviting}><Mail className="ltr:mr-2 rtl:ml-2 h-4 w-4" /> Send Invitation</Button></div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Team & Roles</CardTitle>
          <CardDescription>{admins.length} admin members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {roles.length > 0 && (
            <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map((r) => (
                <div key={r.name} className="rounded-lg border p-3">
                  <p className="font-medium capitalize">{r.name.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {r.permissions.slice(0, 3).map((p) => <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>)}
                    {r.permissions.length > 3 && <Badge variant="outline" className="text-[10px]">+{r.permissions.length - 3}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {admins.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                {(a.full_name ?? '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium">{a.full_name ?? 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">Joined {formatDateTime(a.created_at)}</p>
              </div>
              {a.id !== user?.id ? (
                <>
                  <Select value={a.role} onValueChange={(v) => updateAdminRole(a.id, v)}>
                    <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CEDAR_ROLES.map((r) => <SelectItem key={r} value={r}>{r.replace(/_/g, ' ')}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeAdmin(a.id)}><Trash2 className="h-4 w-4" /></Button>
                </>
              ) : (
                <Badge>You</Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
