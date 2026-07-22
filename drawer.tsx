import type { Metadata } from 'next';
import { StaticLayout, staticMetadata } from '@/components/site/static-layout';

export const metadata: Metadata = staticMetadata('FAQ', 'Frequently asked questions about Cedar.');

const faqs = [
  { q: 'How does Cash on Delivery work?', a: 'You pay in cash when your order arrives at your door. No credit card or online payment needed — simply hand the exact amount to the courier upon delivery.' },
  { q: 'Which countries does Cedar deliver to?', a: 'We currently deliver across the UAE, Saudi Arabia, Egypt, Kuwait, Qatar, Bahrain, Oman, Jordan, and the United States. Delivery times vary by location.' },
  { q: 'How long does delivery take?', a: 'Delivery typically takes 1-6 business days depending on your country and city. The estimated delivery window is shown at checkout based on your address.' },
  { q: 'Are the products authentic?', a: 'Yes. Every product on Cedar is sourced from verified suppliers and brands. We stand behind the authenticity of every item we ship.' },
  { q: 'Can I return a product?', a: 'Yes. We offer a 7-day return policy for most items. If your product is damaged or not as described, contact our support team to initiate a return.' },
  { q: 'How do I track my order?', a: 'Once your order is shipped, you will receive a notification. You can track the status of your order anytime from the Orders page in your account.' },
  { q: 'Do I need an account to order?', a: 'You can browse and add to cart without an account, but creating an account lets you track orders, save addresses, and manage your wishlist.' },
  { q: 'What payment methods are available?', a: 'Cedar currently supports Cash on Delivery only. You pay in cash when your order is delivered — no online payment required.' },
  { q: 'How do I use a coupon code?', a: 'Enter your coupon code in the cart or checkout page and click Apply. The discount will be applied to your order total if the coupon is valid.' },
  { q: 'Is my personal information secure?', a: 'Yes. We use enterprise-grade security with Supabase Auth, JWT tokens, and row-level security policies to protect your data at every step.' },
];

export default function FaqPage() {
  return (
    <StaticLayout title="Frequently Asked Questions" description="Find answers to common questions about shopping with Cedar.">
      <div className="not-prose space-y-3">
        {faqs.map((item, i) => (
          <details key={i} className="glass-card group cursor-pointer p-4">
            <summary className="flex items-center justify-between font-medium text-sm marker:content-none">
              {item.q}
              <span className="text-primary transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </StaticLayout>
  );
}
