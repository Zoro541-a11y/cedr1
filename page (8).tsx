import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/site/product-card';
import { fetchCategories, fetchProductsByCategory } from '@/lib/queries';

interface PageProps {
  params: { slug: string };
}

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const categories = await fetchCategories();
  const cat = categories.find((c) => c.slug === params.slug);
  if (!cat) return { title: 'Category not found' };
  return { title: cat.name, description: cat.description || `Shop ${cat.name} on Cedar` };
}

export default async function CategoryPage({ params }: PageProps) {
  const categories = await fetchCategories();
  const cat = categories.find((c) => c.slug === params.slug);
  if (!cat) notFound();
  const products = await fetchProductsByCategory(params.slug, 48);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link href="/categories" className="hover:text-primary">Categories</Link>
        <span>/</span>
        <span className="font-medium text-foreground">{cat.name}</span>
      </nav>

      {/* header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{cat.name}</h1>
          {cat.description && <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>}
        </div>
        <p className="text-sm text-muted-foreground">{products.length} products</p>
      </div>

      {/* subcategory chips (siblings) */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/categories/${c.slug}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              c.slug === params.slug ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary hover:text-primary'
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium">No products in this category yet</p>
          <Link href="/categories" className="mt-3 text-sm text-primary hover:underline">Browse all categories</Link>
        </div>
      )}
    </div>
  );
}
