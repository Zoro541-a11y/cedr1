'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/language-context';

export default function ContactPage() {
  const { locale } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // simulate submission
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    toast.success(locale === 'ar' ? 'تم إرسال رسالتك!' : 'Message sent!');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'support@cedar.market' },
    { icon: Phone, label: 'Phone', value: '+971 4 123 4567' },
    { icon: MapPin, label: 'Address', value: 'Dubai, United Arab Emirates' },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Contact Us</h1>
        <p className="mt-2 text-sm text-muted-foreground">{locale === 'ar' ? 'نحن هنا لمساعدتك. تواصل معنا في أي وقت.' : "We're here to help. Reach out anytime."}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {contactInfo.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card flex flex-col items-center gap-2 p-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-cedar text-white"><c.icon className="h-5 w-5" /></div>
            <p className="text-sm font-semibold">{c.label}</p>
            <p className="text-sm text-muted-foreground">{c.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.form onSubmit={onSubmit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card mt-6 space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">{locale === 'ar' ? 'الاسم' : 'Name'}</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">{locale === 'ar' ? 'البريد' : 'Email'}</label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="mt-1" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">{locale === 'ar' ? 'الموضوع' : 'Subject'}</label>
          <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">{locale === 'ar' ? 'الرسالة' : 'Message'}</label>
          <Textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required className="mt-1" />
        </div>
        <Button type="submit" disabled={loading} className="rounded-full gradient-cedar text-white hover:opacity-90">
          {loading ? <><Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" /> {locale === 'ar' ? 'جارٍ الإرسال' : 'Sending'}</> : <><Send className="ltr:mr-2 rtl:ml-2 h-4 w-4" /> {locale === 'ar' ? 'إرسال' : 'Send Message'}</>}
        </Button>
      </motion.form>
    </div>
  );
}
