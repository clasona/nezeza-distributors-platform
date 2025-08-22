// utils/getClientUrl.ts

/**
 * Returns the current client URL.
 * - On the browser: uses window.location.origin.
 * - On the server: uses NEXT_PUBLIC_CLIENT_URL env variable.
 * - Falls back to a list of known domains if available.
 */
export function getClientUrl(): string {
  if (typeof window !== "undefined" && window.location) {
    // Running in the browser
    // console.log("Running in browser, using window.location.origin");
    return window.location.origin;
  }

  // Running on server (SSR, API routes, etc.)
  if (process.env.NEXT_PUBLIC_CLIENT_URL) {
    // console.log("Using NEXT_PUBLIC_CLIENT_URL:", process.env.NEXT_PUBLIC_CLIENT_URL);
    return process.env.NEXT_PUBLIC_CLIENT_URL;
  }

  // Fallback: Known production domains (customize as needed)
  const knownDomains = [
    "https://www.vesoko.com",
    "https://vesoko.com",
    "https://test.soko.online",
    "https://test.vesoko.com"
  ];
  console.warn("No client URL found in environment. Falling back to known domains:", knownDomains);
  // Optionally, pick the first one or use some logic to select
  return knownDomains[0];
}