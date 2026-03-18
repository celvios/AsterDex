/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Suppress hydration warnings from browser extensions
    compiler: {
        removeConsole: process.env.NODE_ENV === "production",
    },
};

module.exports = nextConfig;
