import type { Metadata } from 'next';
import { StaticLayout, staticMetadata } from '@/components/site/static-layout';

export const metadata: Metadata = staticMetadata('Terms of Service', 'The terms and conditions for using Cedar.');

export default function TermsPage() {
  return (
    <StaticLayout title="Terms of Service" description="Last updated: January 2026">
      <p>By accessing or using Cedar, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>

      <h2>1. Eligibility</h2>
      <p>You must be at least 18 years old or have parental consent to use Cedar. By placing an order, you represent that you meet these requirements.</p>

      <h2>2. Account</h2>
      <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized use.</p>

      <h2>3. Orders & Payment</h2>
      <ul>
        <li>All orders are fulfilled via Cash on Delivery. You pay the courier in cash upon delivery.</li>
        <li>Order acceptance is subject to product availability and delivery to your area.</li>
        <li>Prices and availability may change without notice.</li>
        <li>You must provide accurate delivery information. We are not responsible for failed deliveries due to incorrect details.</li>
      </ul>

      <h2>4. Returns & Refunds</h2>
      <p>We offer a 7-day return policy for most items. Products must be unused and in original packaging. See our Return Policy for full details.</p>

      <h2>5. Prohibited Conduct</h2>
      <ul>
        <li>Using the platform for fraudulent or unlawful purposes.</li>
        <li>Attempting to access unauthorized areas or data.</li>
        <li>Interfering with the platform's security or functionality.</li>
        <li>Placing orders with no intention to pay (Cash on Delivery abuse).</li>
      </ul>

      <h2>6. Intellectual Property</h2>
      <p>All content on Cedar — including logos, designs, text, and graphics — is the property of Cedar or its licensors and is protected by intellectual property laws.</p>

      <h2>7. Limitation of Liability</h2>
      <p>Cedar is provided "as is" without warranties. We are not liable for indirect or consequential damages arising from your use of the platform.</p>

      <h2>8. Changes</h2>
      <p>We may update these Terms at any time. Continued use after changes constitutes acceptance of the updated Terms.</p>

      <h2>9. Contact</h2>
      <p>For questions about these Terms, contact support@cedar.market.</p>
    </StaticLayout>
  );
}
