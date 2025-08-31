/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      // Backend’ten ürün görselleri geliyorsa onları da ekle:
      // { protocol: "http", hostname: "localhost" }, // dev ortam
      // { protocol: "https", hostname: "api.senin-domain.com" },
    ],
  },
};

export default nextConfig;
