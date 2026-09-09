import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── React strict mode ──────────────────────────────────────────────────────
  // Highlights potential issues during development; has no effect on production
  // bundle size or performance.
  reactStrictMode: true,

  // ── Image optimisation ────────────────────────────────────────────────────
  // List every external hostname your <Image> components load from.
  // Vercel's built-in image optimiser will only process allowed domains.
  images: {
    remotePatterns: [
      // Google user avatars (OAuth sign-in profile pictures)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // Supabase storage bucket (property / profile images)
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Vercel Blob storage (future property uploads)
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
    // Use WebP/AVIF for supported browsers to reduce bandwidth
    formats: ["image/avif", "image/webp"],
  },

  // ── Runtime environment variables exposed to the browser ─────────────────
  // Values here are baked into the client bundle at build time.
  // Only use NEXT_PUBLIC_ prefix for non-secret values.
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "",
    NEXT_PUBLIC_GOOGLE_MAPS_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "",
  },

  // ── Compiler options ──────────────────────────────────────────────────────
  compiler: {
    // Strip console.log in production but keep console.warn / console.error
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["warn", "error"] }
        : false,
  },

  // ── Experimental (Next 15 / Turbopack) ───────────────────────────────────
  // Opt-in to the App Router's server-action body-size limit increase only
  // if you send large property images through server actions; default is fine
  // for most use-cases.
  // serverActions: { bodySizeLimit: "4mb" },

  // ── Output mode ───────────────────────────────────────────────────────────
  // "standalone" bundles only the files needed to run the app which keeps the
  // Vercel deployment artefact lean. Vercel detects this automatically.
  output: "standalone",
};

export default nextConfig;
