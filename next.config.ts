import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "pbs.twimg.com" }, // Twitter/X images
      { protocol: "https", hostname: "authory.com" },
      { protocol: "https", hostname: "profile-images.authory.com" }, // Authory assets
      { protocol: "https", hostname: "images-production.authory.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
    dangerouslyAllowSVG: true, // Needed for some placeholders
  },
};

export default nextConfig;
