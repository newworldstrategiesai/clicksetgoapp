'use client';

import { useEffect } from 'react';
import Head from 'next/head';

export default function HomePage() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://js.stripe.com/v3/pricing-table.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div>
      <Head>
        <title>Home Page</title>
      </Head>
      <main>
        <h1>Welcome to Our Service</h1>
        <stripe-pricing-table
          pricing-table-id="prctbl_1PcwWfEJct0cvYrGMzgRWLJz"
          publishable-key="pk_live_51OUH9GEJct0cvYrGZsaXzutR3cLpWkGRlMVzKsqBCQjYaXHJUfuk9qtMjwy7fxlcQVOhgyyshPHGxIwZIgXby2QW00QPLmick3"
        ></stripe-pricing-table>
      </main>
    </div>
  );
}