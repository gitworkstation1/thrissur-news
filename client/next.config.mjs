/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing image configuration
  images: {
    unoptimized: true, 
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
  
  // --- ⚡ NEW: The Security Proxy Tunnel for Cookies ---
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        // Use your localhost URL if you are currently testing locally, 
        // otherwise leave this as your Render URL for production!
        destination: 'https://thrissur-news-backend.onrender.com/api/:path*'
      }
    ]
  }
};

export default nextConfig;