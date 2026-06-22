/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // <-- NEW: Stops local server timeout crashes
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;