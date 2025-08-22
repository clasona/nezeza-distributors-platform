// utils/getClientUrl.js

function getClientUrl(req) {
  // Preferred: Use req if provided
  if (req && typeof req === 'object') {
    // Browser CORS requests usually send this header
    if (req.headers && req.headers.origin) return req.headers.origin;

    // Build from protocol and host if headers.origin is not present
    const protocol = req.protocol ||
      (req.connection && req.connection.encrypted ? 'https' : 'http');
    const host = req.headers && req.headers.host;
    // console.log('getClientUrl: Detected protocol:', protocol, 'host:', host);
    if (host) return `${protocol}://${host}`;
  }

  // Attempt to detect known hostnames (as a fallback)
  // You can extend this list with any domains you expect to support
  const knownDomains = [
    "https://www.vesoko.com",
    "https://vesoko.com",
    "https://test.soko.online",
    "https://test.vesoko.com"
  ];
  // If you want to use the first available known domain as fallback:
  for (const domain of knownDomains) {
    if (domain) {
      // console.log('getClientUrl: Using known domain:', domain);
      return domain;
    }
  }

  // Fallback to environment variable
  if (process.env.CLIENT_URL) {
    // console.log('getClientUrl: Using CLIENT_URL env:', process.env.CLIENT_URL);
    return process.env.CLIENT_URL;
  }

  // Last fallback: empty string
  console.warn('getClientUrl: No req, no known domain, and no CLIENT_URL env. Returning empty string.');
  return '';
}

module.exports = getClientUrl;