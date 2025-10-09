/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: 'https', hostname: "www.merlinbikegear.com"},
      { protocol: 'https' , hostname: "imgbb.com"}
      
      // { protocol: "http", hostname: "localhost" }, 
    ],

    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
