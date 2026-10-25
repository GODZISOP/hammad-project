import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      { source: "/3d", destination: "/category/3d-character" },
      { source: "/vtuber", destination: "/category/vtuber" },
      { source: "/emotes", destination: "/category/emotes" },
      { source: "/overlay", destination: "/category/overlay" },
      { source: "/oc", destination: "/category/oc-character" },
      { source: "/vrchat", destination: "/category/vrchat-avatars" },
      { source: "/banner", destination: "/category/banner" },
      { source: "/thumbnail", destination: "/category/thumbnail" },
      { source: "/logos", destination: "/category/logos" },
      { source: "/book-cover", destination: "/category/book-cover" },
      { source: "/art-scenes", destination: "/category/art-scenes" },
      { source: "/2d", destination: "/category/2d-character" },
    ];
  },
};

export default nextConfig;
