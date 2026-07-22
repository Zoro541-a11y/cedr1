import { useEffect, useState } from 'react';
import { Truck, Save, MapPin, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, DeliverySettings } from '../lib/supabase';

export function DeliverySettingsAdmin() {
  const [settings, setSettings] = useState<DeliverySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState(3);
  const [deliveryFee, setDeliveryFee] = useState(5);
  const [freeThreshold, setFreeThreshold] = useState(50);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('delivery_settings').select('*').eq('id', 1).maybeSingle();
      if (error) { toast.error('Failed to load delivery settings'); }
      else if (data) {
        const s = data as DeliverySettings;
        setSettings(s);
        setDeliveryTime(s.delivery_time_days);
        setDeliveryFee(Number(s.delivery_fee));
        setFreeThreshold(Number(s.free_delivery_threshold));
        setIsActive(s.is_active);
      }
      setLoading(false);
    })();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      id: 1, delivery_time_days: deliveryTime, delivery_fee: deliveryFee,
      free_delivery_threshold: freeThreshold, is_active: isActive,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('delivery_settings').upsert(payload);
    if (error) { toast.error('Failed to save settings'); }
    else { toast.success('Delivery settings saved'); }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-gray-400"><Truck className="h-8 w-8 animate-pulse" /></div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
        <div className="mb-1 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-gray-900 dark:text-white">Delivery Country</h2>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-primary-50 dark:bg-primary-900/30 px-4 py-3">
          <span className="text-2xl">🇱🇧</span>
          <div>
            <p className="font-semibold text-primary-700 dark:text-primary-300">Lebanon</p>
            <p className="text-xs text-primary-600 dark:text-primary-400">Only delivery country — all orders ship within Lebanon</p>
          </div>
        </div>
      </div>

      <form onSubmit={save} className="space-y-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
        <h2 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white"><Truck className="h-5 w-5 text-primary" /> Delivery Settings</h2>

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"><Clock className="h-4 w-4 text-gray-400" /> Delivery Time (days)</label>
          <input type="number" min="1" max="30" value={deliveryTime} onChange={(e) => setDeliveryTime(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          <p className="mt-1 text-xs text-gray-400">Estimated delivery time shown to customers</p>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"><DollarSign className="h-4 w-4 text-gray-400" /> Delivery Fee ($)</label>
          <input type="number" step="0.01" min="0" value={deliveryFee} onChange={(e) => setDeliveryFee(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          <p className="mt-1 text-xs text-gray-400">Flat delivery fee charged per order</p>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"><DollarSign className="h-4 w-4 text-gray-400" /> Free Delivery Threshold ($)</label>
          <input type="number" step="0.01" min="0" value={freeThreshold} onChange={(e) => setFreeThreshold(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          <p className="mt-1 text-xs text-gray-400">Orders above this amount get free delivery</p>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${isActive ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-300">Delivery available (accepting orders)</span>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
