import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	reactCompiler: true,
	output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
};

export default nextConfig;
