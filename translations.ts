import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, Package2, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, Product, Category, getProductImage } from '../lib/supabase';

export function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) { toast.error('Failed to load products'); }
    else { setProducts((data ?? []) as Product[]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      setCategories((data ?? []) as Category[]);
    })();
    fetchProducts();
  }, [fetchProducts]);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || p.category_id === filterCat;
    return matchSearch && matchCat;
  });

  const openAdd = () => { setEditing(null); setImageUrl(''); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setImageUrl(getProductImage(p) ?? ''); setModalOpen(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const name = (fd.get('name') as string).trim();
    if (!name) { toast.error('Product name is required'); return; }

    const data: any = {
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      description: (fd.get('description') as string) || null,
      category_id: (fd.get('category_id') as string) || null,
      price: Number(fd.get('price')) || 0,
      compare_at_price: fd.get('compare_at_price') ? Number(fd.get('compare_at_price')) : null,
      stock: Number(fd.get('stock')) || 0,
      is_active: fd.get('is_active') === 'on',
      media: imageUrl ? { images: [imageUrl] } : { images: [] },
      updated_at: new Date().toISOString(),
    };

    setSaving(true);
    if (editing) {
      const { error } = await supabase.from('products').update(data).eq('id', editing.id);
      if (error) { toast.error('Failed to update product'); }
      else { toast.success('Product updated'); setModalOpen(false); fetchProducts(); }
    } else {
      const { error } = await supabase.from('products').insert(data);
      if (error) { toast.error('Failed to add product'); }
      else { toast.success('Product added'); setModalOpen(false); fetchProducts(); }
    }
    setSaving(false);
  };

  const doDelete = async (p: Product) => {
    const { error } = await supabase.from('products').delete().eq('id', p.id);
    if (error) { toast.error('Failed to delete product'); }
    else { toast.success('Product deleted'); setProducts((prev) => prev.filter((x) => x.id !== p.id)); }
    setConfirmDelete(null);
  };

  const toggleActive = async (p: Product) => {
    const { error } = await supabase.from('products').update({ is_active: !p.is_active, updated_at: new Date().toISOString() }).eq('id', p.id);
    if (error) { toast.error('Failed to update status'); }
    else { setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_active: !x.is_active } : x))); }
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-2 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button onClick={openAdd} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-600">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-gray-400"><Package2 className="h-8 w-8 animate-pulse" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 dark:border-gray-700 py-16 text-gray-400">
          <Package2 className="mb-2 h-10 w-10" /><p className="text-sm">No products found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Product</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">Price</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">Stock</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-400">Active</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const img = getProductImage(p);
                return (
                  <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {img ? (
                          <img src={img} alt={p.name} className="h-10 w-10 rounded-lg object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                            <Package2 className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{p.name}</p>
                          <p className="max-w-xs truncate text-xs text-gray-400">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">${Number(p.price).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={p.stock <= 5 ? 'font-medium text-red-500' : 'text-gray-700 dark:text-gray-300'}>
                        {p.stock}{p.stock <= 5 && p.stock > 0 && ' (low)'}{p.stock === 0 && ' (out)'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleActive(p)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${p.is_active ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${p.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setConfirmDelete(p)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
                <input name="name" defaultValue={editing?.name ?? ''} required
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Price ($) *</label>
                  <input name="price" type="number" step="0.01" min="0" defaultValue={editing?.price ?? ''} required
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Compare At ($)</label>
                  <input name="compare_at_price" type="number" step="0.01" min="0" defaultValue={editing?.compare_at_price ?? ''}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Stock *</label>
                  <input name="stock" type="number" min="0" defaultValue={editing?.stock ?? 0} required
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                  <select name="category_id" defaultValue={editing?.category_id ?? ''}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:border-primary">
                    <option value="">Uncategorized</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://images.pexels.com/..."
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 h-20 w-20 rounded-lg border border-gray-200 dark:border-gray-700 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea name="description" defaultValue={editing?.description ?? ''} rows={3}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" name="is_active" defaultChecked={editing?.is_active ?? true}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  Active (visible to customers)
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div><h3 className="font-bold text-gray-900 dark:text-white">Delete Product</h3><p className="text-sm text-gray-500">This cannot be undone.</p></div>
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Are you sure you want to delete <strong>{confirmDelete.name}</strong>?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
              <button onClick={() => doDelete(confirmDelete)} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
