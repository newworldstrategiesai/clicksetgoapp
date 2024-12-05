// app/head.tsx

import { getURL } from '@/utils/helpers';

export default function Head() {
  const title = 'CLICK SET GO AI';
  const description = 'Brought to you by Vercel, Stripe, and Supabase.';

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={getURL()} />
    </>
  );
}
