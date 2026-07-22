import type { Metadata } from 'next';
import { StaticLayout, staticMetadata } from '@/components/site/static-layout';

export const metadata: Metadata = staticMetadata('Delivery Policy', 'How Cedar delivers your orders.');

export default function DeliveryPolicyPage() {
  const countries = [
    { country: 'United Arab Emirates', cost: '$5', time: '1-3 business days' },
    { country: 'Saudi Arabia', cost: '$6', time: '2-4 business days' },
    { country: 'Egypt', cost: '$3', time: '2-5 business days' },
    { country: 'Kuwait', cost: '$7', time: '3-5 business days' },
    { country: 'Qatar', cost: '$7', time: '3-5 business days' },
    { country: 'Bahrain', cost: '$7', time: '3-5 business days' },
    { country: 'Oman', cost: '$8', time: '4-6 business days' },
    { country: 'Jordan', cost: '$6', time: '3-6 business days' },
    { country: 'United States', cost: '$9', time: '5-10 business days' },
  ];

  return (
    <StaticLayout title="Delivery Policy" description="Cash on Delivery, shipping times, and coverage.">
      <h2>Cash on Delivery</h2>
      <p>Cedar operates exclusively on Cash on Delivery. You pay the courier in cash when your order arrives — no online payment or credit card required.</p>

      <h2>Delivery Coverage</h2>
      <p>We currently deliver to the following countries. Delivery costs and estimated times are shown below and confirmed at checkout:</p>

      <div className="not-prose my-4 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-2.5 text-start font-medium">Country</th>
              <th className="px-4 py-2.5 text-start font-medium">Delivery Cost</th>
              <th className="px-4 py-2.5 text-start font-medium">Estimated Time</th>
            </tr>
          </thead>
          <tbody>
            {countries.map((c, i) => (
              <tr key={i} className={i % 2 ? 'bg-muted/20' : ''}>
                <td className="px-4 py-2.5">{c.country}</td>
                <td className="px-4 py-2.5 font-medium text-primary">{c.cost}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{c.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Order Processing</h2>
      <ul>
        <li>Orders are processed within 24 hours of placement.</li>
        <li>You will receive a notification when your order status changes (confirmed, preparing, shipped, delivered).</li>
        <li>Track your order anytime from the Orders page in your account.</li>
      </ul>

      <h2>Delivery Requirements</h2>
      <ul>
        <li>Please provide a complete and accurate delivery address including building and street details.</li>
        <li>Ensure someone is available to receive the order and pay the courier.</li>
        <li>Have the exact cash amount ready — couriers may not carry change.</li>
      </ul>

      <h2>Failed Deliveries</h2>
      <p>If delivery fails due to an incorrect address or no one being available, we will attempt to contact you to reschedule. After two failed attempts, the order may be cancelled.</p>
    </StaticLayout>
  );
}
