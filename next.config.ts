import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: [
    "@chroma-core/google-gemini",
    "chromadb",
    "pdf-parse",
  ],
  turbopack: {
    ignoreIssue: [
      {
        path: /node_modules[\/\\]@chroma-core[\/\\]google-gemini/,
      },
    ],
  },
};

export default nextConfig;
