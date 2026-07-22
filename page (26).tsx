import type { Metadata } from 'next';
import { StaticLayout, staticMetadata } from '@/components/site/static-layout';
import { Package, Truck, ShieldCheck, Users, Globe, Award } from 'lucide-react';

export const metadata: Metadata = staticMetadata('About', 'Learn about Cedar — the premium dropshipping marketplace.');

export default function AboutPage() {
  const stats = [
    { icon: Users, label: 'Happy Customers', value: '50K+' },
    { icon: Package, label: 'Products', value: '10K+' },
    { icon: Globe, label: 'Countries', value: '9' },
    { icon: Award, label: 'Avg Rating', value: '4.7' },
  ];
  const values = [
    { icon: ShieldCheck, title: 'Authentic Products', desc: 'Every item is sourced from verified suppliers and brands.' },
    { icon: Truck, title: 'Fast Delivery', desc: '1-6 business days with Cash on Delivery across the region.' },
    { icon: Package, title: 'Curated Catalog', desc: 'Handpicked products across electronics, fashion, home and more.' },
  ];

  return (
    <StaticLayout title="About Cedar" description="Premium marketplace, delivered.">
      <p className="text-lg">
        Cedar is a premium dropshipping marketplace built to make quality products accessible
        across the Middle East and beyond. We combine a curated catalog, competitive prices, and
        the convenience of Cash on Delivery to deliver a shopping experience that feels effortless.
      </p>

      <div className="my-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i} className="glass-card flex flex-col items-center gap-2 p-4 text-center">
            <s.icon className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gradient-cedar">{s.value}</span>
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      <h2>Our Values</h2>
      <div className="my-4 grid gap-4 md:grid-cols-3 not-prose">
        {values.map((v, i) => (
          <div key={i} className="glass-card p-4">
            <v.icon className="mb-2 h-6 w-6 text-secondary" />
            <h3 className="font-semibold">{v.title}</h3>
            <p className="text-sm text-muted-foreground">{v.desc}</p>
          </div>
        ))}
      </div>

      <h2>Our Story</h2>
      <p>
        Founded with a simple mission — to bring the best products to your door with the trust and
        transparency you deserve — Cedar has grown into a marketplace serving customers across nine
        countries. From the latest electronics to everyday fashion, beauty, and home essentials,
        every product is chosen with care.
      </p>
      <p>
        We believe shopping online should be safe, simple, and enjoyable. That is why we offer Cash
        on Delivery, fast shipping, and a 7-day return policy on most items. Our support team is
        available around the clock to help with any question.
      </p>
    </StaticLayout>
  );
}
