import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // add any domains/routes that we should allow images to be fetched from
  images: {
    domains: [
      'fakestoreapi.com',
      'dl.airtable.com',
      'nezeza-products.s3.us-east-2.amazonaws.com',
    ],
  },
};

export default nextConfig;
