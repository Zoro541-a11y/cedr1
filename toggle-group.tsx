import type { Metadata } from 'next';
import { StaticLayout, staticMetadata } from '@/components/site/static-layout';

export const metadata: Metadata = staticMetadata('Return Policy', 'Cedar 7-day return policy.');

export default function ReturnPolicyPage() {
  return (
    <StaticLayout title="Return Policy" description="7-day returns for most products.">
      <h2>7-Day Return Window</h2>
      <p>You may return most items within 7 days of delivery for a full refund or exchange, provided the conditions below are met.</p>

      <h2>Return Conditions</h2>
      <ul>
        <li>The product must be unused, unwashed, and in its original packaging.</li>
        <li>All accessories, tags, and free gifts must be included.</li>
        <li>The product must not be damaged due to misuse by the customer.</li>
        <li>You must have the order number and proof of purchase.</li>
      </ul>

      <h2>Non-Returnable Items</h2>
      <ul>
        <li>Personal care and beauty products (for hygiene reasons).</li>
        <li>Innerwear and swimwear.</li>
        <li>Customized or personalized items.</li>
        <li>Products marked as "final sale" or "non-returnable".</li>
      </ul>

      <h2>How to Initiate a Return</h2>
      <ol>
        <li>Contact our support team at support@cedar.market with your order number.</li>
        <li>Our team will review your request and confirm eligibility within 24 hours.</li>
        <li>If approved, we will arrange a pickup of the product from your address.</li>
        <li>Once the returned product is received and inspected, a refund will be processed.</li>
      </ol>

      <h2>Refunds</h2>
      <p>Since Cedar operates on Cash on Delivery, refunds are processed via bank transfer or store credit, depending on your preference. Refunds are typically processed within 5-7 business days after we receive and inspect the returned product.</p>

      <h2>Damaged or Wrong Products</h2>
      <p>If you receive a damaged or incorrect product, contact us within 48 hours of delivery with photos. We will arrange a replacement or full refund at no cost to you.</p>

      <h2>Contact</h2>
      <p>For return-related questions, contact support@cedar.market.</p>
    </StaticLayout>
  );
}
