import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    transpilePackages: ['@repo/prisma', '@repo/trpc'],
};

export default nextConfig;
