// app/pricing/page.tsx
import Pricing from '@/components/ui/Pricing/Pricing';
import { createClient } from '@/server';
import {
  getProducts,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';

export default async function PricingPage() {
  const supabase = createClient();
  const [user, products, subscription] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
    getSubscription(supabase)
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Pricing
        user={user}
        products={products ?? []}
        subscription={subscription}
      />
      <footer className="bg-gray-100 text-gray-700 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-lg font-semibold">Privacy Policy</h2>
          <p className="mt-2 text-sm">
            This Privacy Policy explains how we collect, use, and safeguard your information.
          </p>
          <p className="mt-2 text-sm">
            We collect information you provide to us, including personal data like your name and email address.
          </p>
          <p className="mt-2 text-sm">
            We use your information to operate and improve our services and to communicate with you.
          </p>
          <p className="mt-2 text-sm">
            We do not sell your information to third parties. We may share your information with service providers who assist us in delivering our services.
          </p>
          <p className="mt-2 text-sm">
            You can access, update, or delete your information by contacting us directly.
          </p>
          <p className="mt-2 text-sm">
            If you have any questions about this Privacy Policy, please contact us at [Your Contact Information].
          </p>
        </div>
      </footer>
    </div>
  );
}
