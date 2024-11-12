import Pricing from '@/components/ui/Pricing/Pricing';
import { createClient } from '@/server';
import {
  getProducts,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';

export default async function PricingPage() {
  const supabase = await createClient();

  const user = await getUser(supabase);
  const products = await getProducts(supabase);
  const subscription = await getSubscription(supabase);

  return (
    <Pricing
      user={user}
      products={products ?? []}
      subscription={subscription}
    />
  );
}
