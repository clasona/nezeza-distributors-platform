import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true, //causes the components to run twice, read more: https://stackoverflow.com/questions/60618844/react-hooks-useeffect-is-called-twice-even-if-an-empty-array-is-used-as-an-ar
  // add any domains/routes that we should allow images to be fetched from
  images: {
    domains: [
      'fakestoreapi.com',
      'dl.airtable.com',
      'nezeza-products.s3.us-east-2.amazonaws.com',
      'res.cloudinary.com',
    ],
  },
};

export default nextConfig;
