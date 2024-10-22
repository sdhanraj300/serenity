/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',  // Include protocol
                hostname: 'utfs.io',
            },
            {
                protocol: 'https',  // Include protocol
                hostname: 'lh3.googleusercontent.com',
            }
        ],
    },
};

export default nextConfig;
