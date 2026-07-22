import type { Metadata } from 'next';
import { StaticLayout, staticMetadata } from '@/components/site/static-layout';

export const metadata: Metadata = staticMetadata('Privacy Policy', 'How Cedar collects, uses, and protects your data.');

export default function PrivacyPage() {
  return (
    <StaticLayout title="Privacy Policy" description="Last updated: January 2026">
      <p>Cedar ("we", "us", "our") is committed to protecting your privacy. This policy explains what data we collect, how we use it, and the choices you have.</p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li><strong>Account data:</strong> name, email, phone number when you create an account.</li>
        <li><strong>Order data:</strong> delivery address, phone, and order details when you place an order.</li>
        <li><strong>Usage data:</strong> pages visited, search queries, and device information for analytics.</li>
        <li><strong>Wishlist & cart:</strong> products you save, stored locally and (when signed in) on our servers.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To process and deliver your orders.</li>
        <li>To communicate with you about orders, promotions, and support.</li>
        <li>To improve our products, services, and website experience.</li>
        <li>To prevent fraud and ensure platform security.</li>
      </ul>

      <h2>3. Data Security</h2>
      <p>We use enterprise-grade security measures including Supabase Auth, JWT-based sessions, row-level security policies, and encrypted connections (HTTPS). Your payment is handled via Cash on Delivery — we do not store credit card information.</p>

      <h2>4. Data Sharing</h2>
      <p>We do not sell your personal data. We share data only with shipping partners to deliver your orders and with service providers who help us operate the platform, under strict confidentiality agreements.</p>

      <h2>5. Your Rights</h2>
      <ul>
        <li>Access and update your profile information at any time.</li>
        <li>Request deletion of your account and associated data.</li>
        <li>Opt out of marketing emails at any time.</li>
      </ul>

      <h2>6. Cookies</h2>
      <p>We use cookies and local storage to remember your language preference, theme, cart, and wishlist. You can clear these in your browser settings at any time.</p>

      <h2>7. Contact</h2>
      <p>For privacy questions, contact us at support@cedar.market.</p>
    </StaticLayout>
  );
}
