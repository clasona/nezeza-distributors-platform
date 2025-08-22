// utils/getServerUrl.ts

import { getClientUrl } from "./getClientUrl";

/**
 * Returns the current client URL.
 * - On the browser: uses window.location.origin.
 * - On the server: uses NEXT_PUBLIC_CLIENT_URL env variable.
 * - Falls back to a list of known domains if available.
 */
export function getServerUrl(): string {
  const clientUrl = getClientUrl();
  // lets use equals exact 
  if (clientUrl === "https://www.vesoko.com" || clientUrl === "https://vesoko.com") {
    // console.log("Using vesoko-backend for server URL");
    return clientUrl + "/vesoko-backend";
  } else if (clientUrl === "https://test.soko.online" || clientUrl === "https://test.vesoko.com") {
    console.log("Using nezeza-backend for server URL");
    return clientUrl + "/nezeza-backend";
  } else{
    // console.log("Falling back to NEXT_PUBLIC_BACKEND_URL");
    if (process.env.NEXT_PUBLIC_BACKEND_URL) {
      return process.env.NEXT_PUBLIC_BACKEND_URL;
    } 
  }

  return "";
}