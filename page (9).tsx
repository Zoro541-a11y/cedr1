import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchCategories } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse all product categories on Cedar.',
};

export const revalidate = 300;

export default async function CategoriesPage() {
  const categories = await fetchCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Shop by Category</h1>
        <p className="mt-1 text-sm text-muted-foreground">Explore our wide range of product categories</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/categories/${c.slug}`}
            className="glass-card group relative aspect-[4/3] overflow-hidden"
          >
            {c.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.image_url}
                alt={c.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <h2 className="text-lg font-bold">{c.name}</h2>
              {c.description && <p className="mt-1 line-clamp-1 text-sm text-white/80">{c.description}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
