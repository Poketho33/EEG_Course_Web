import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    compress: true,

    // images example
    // images: {
    //     remotePatterns: [
    //         {
    //             protocol: "https",
    //             hostname: "image.tmdb.org",
    //             pathname: "/t/p/**",
    //         },
    //     ],
    // },
};

export default nextConfig;
