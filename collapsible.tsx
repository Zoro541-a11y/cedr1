import { HeroBanner } from '@/components/site/hero-banner';
import { FlashSaleSection } from '@/components/site/flash-sale-section';
import { CategoryGrid, BrandGrid } from '@/components/site/category-brand-grid';
import { ReviewsSection } from '@/components/site/reviews-section';
import { FaqSection } from '@/components/site/faq-section';
import { SectionHeader } from '@/components/site/section-header';
import { ProductGrid } from '@/components/site/product-card';
import {
  fetchFlashSaleProducts,
  fetchTodaysDeals,
  fetchFeaturedProducts,
  fetchTrendingProducts,
  fetchBestSellers,
  fetchNewArrivals,
  fetchCategories,
  fetchBrands,
} from '@/lib/queries';

export const revalidate = 300;

export default async function HomePage() {
  const [flashSale, todaysDeals, featured, trending, bestSellers, newArrivals, categories, brands] =
    await Promise.all([
      fetchFlashSaleProducts(12),
      fetchTodaysDeals(12),
      fetchFeaturedProducts(12),
      fetchTrendingProducts(12),
      fetchBestSellers(12),
      fetchNewArrivals(12),
      fetchCategories(),
      fetchBrands(),
    ]);

  return (
    <div className="flex flex-col">
      <HeroBanner />

      <FlashSaleSection products={flashSale} />

      <section className="mx-auto w-full max-w-7xl px-4 py-8">
        <SectionHeader title="Today's Deals" href="/search?sort=deals" viewAllLabel="View all" />
        <ProductGrid products={todaysDeals} />
      </section>

      <CategoryGrid categories={categories} />

      <section className="mx-auto w-full max-w-7xl px-4 py-8">
        <SectionHeader title="Featured Products" href="/search?filter=featured" viewAllLabel="View all" />
        <ProductGrid products={featured} />
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8">
        <SectionHeader title="Trending Now" href="/search?filter=trending" viewAllLabel="View all" accent="gold" />
        <ProductGrid products={trending} />
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8">
        <SectionHeader title="Best Sellers" href="/search?filter=bestseller" viewAllLabel="View all" />
        <ProductGrid products={bestSellers} />
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8">
        <SectionHeader title="New Arrivals" href="/search?filter=new" viewAllLabel="View all" accent="gold" />
        <ProductGrid products={newArrivals} />
      </section>

      <BrandGrid brands={brands} />

      <ReviewsSection />

      <FaqSection />
    </div>
  );
}
