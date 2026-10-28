import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,

  turbopack: {
    root: __dirname,
    // Импорты SVG преобразуются в React-компоненты с размерами 1em.
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: { icon: true },
          },
        ],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
