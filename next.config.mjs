// Project pages on GitHub Pages are served from https://<user>.github.io/<repo>/,
// not the domain root, so the exported build needs to know that prefix in advance —
// it's baked into every asset URL at build time. Set via the deploy workflow; empty
// locally so `npm run dev` / `npm run build` still work at the root.
const basePath = process.env.NEXT_BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
