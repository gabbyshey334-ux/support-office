/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /** Browsers default to /favicon.ico; serve the same image as app/icon.tsx */
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/icon" }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
