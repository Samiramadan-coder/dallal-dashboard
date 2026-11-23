import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
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
