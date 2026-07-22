import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ProductDetail } from '@/components/site/product-detail';
import { fetchProductBySlug, fetchRelatedProducts } from '@/lib/queries';

interface PageProps {
  params: { slug: string };
}

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await fetchProductBySlug(params.slug);
  if (!product) return { title: 'Product not found' };
  return {
    title: product.meta_title || product.name,
    description: product.meta_description || product.description || undefined,
    openGraph: {
      title: product.name,
      description: product.meta_description || product.description || undefined,
      images: product.media?.images?.[0] ? [{ url: product.media.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const product = await fetchProductBySlug(params.slug);
  if (!product) notFound();
  const related = await fetchRelatedProducts(product, 12);
  return <ProductDetail product={product} related={related} />;
}
