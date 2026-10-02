import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * The site used to serve /products, /about and so on. Those are now under
   * a locale prefix, so the old flat URLs are permanently redirected to their
   * Marathi equivalents - Marathi is the default locale, so that is the right
   * landing page for any existing link, bookmark or external backlink.
   *
   * Next.js carries the query string across automatically, so
   * /products?category=filters lands on /mr/products?category=filters.
   */
  async redirects() {
    return [
      // Temporary on purpose: "/" is not a real page any more, it is a
      // language entry point. A permanent redirect would be cached by
      // browsers indefinitely and make it very hard to revisit that decision.
      { source: "/", destination: "/mr", permanent: false },
      { source: "/products", destination: "/mr/products", permanent: true },
      { source: "/products/:slug", destination: "/mr/products/:slug", permanent: true },
      { source: "/about", destination: "/mr/about", permanent: true },
      { source: "/contact", destination: "/mr/contact", permanent: true },
      {
        source: "/become-a-distributor",
        destination: "/mr/become-a-distributor",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
