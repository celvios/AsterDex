/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Suppress hydration warnings from browser extensions
    compiler: {
        removeConsole: process.env.NODE_ENV === "production",
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                fs: false,
                net: false,
                tls: false,
            };
        }
        config.externals.push('pino-pretty', 'lokijs', 'encoding');
        config.resolve.alias = {
            ...config.resolve.alias,
            '@react-native-async-storage/async-storage': false,
        };
        return config;
    },
};

module.exports = nextConfig;
