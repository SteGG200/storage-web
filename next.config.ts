import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	reactCompiler: true,
	env: {
		SERVER_URL: process.env.SERVER_URL || '',
	},
};

export default nextConfig;
