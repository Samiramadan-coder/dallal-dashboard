import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { BASE_PATH } from "./lib/base-path";

const nextConfig: NextConfig = {
  // The dashboard lives under /admin on the main domain. Links from
  // next/link, next-intl and next/navigation add it automatically; absolute
  // URLs built by hand (redirects in proxy.ts and route handlers) must add
  // `request.nextUrl.basePath` themselves
  basePath: BASE_PATH,
  experimental: {
    // Enables forbidden() for pages the admin has no permission for
    authInterrupts: true,
    serverActions: {
      // Default is 1mb; uploads (e.g. a country flag, up to 1mb) plus the
      // other form fields need headroom
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dallalhoolee.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
