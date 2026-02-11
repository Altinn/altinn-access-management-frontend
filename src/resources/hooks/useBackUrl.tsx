import { useSearchParams } from 'react-router';

/**
 * Validates that a URL is safe to redirect to (relative path only, same origin)
 */
const isValidReturnUrl = (url: string): boolean => {
  // Must start with a single forward slash (relative path)
  if (!url.startsWith('/')) {
    return false;
  }

  // Prevent protocol-relative URLs (e.g., //evil.com)
  if (url.startsWith('//')) {
    return false;
  }

  // Prevent backslash tricks (e.g., /\evil.com)
  if (url.includes('\\')) {
    return false;
  }

  try {
    // Parse the URL relative to current origin to check for any tricks
    const parsed = new URL(url, window.location.origin);

    // Ensure it stays on the same origin
    if (parsed.origin !== window.location.origin) {
      return false;
    }

    // Block dangerous protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    return true;
  } catch {
    // If URL parsing fails, reject it
    return false;
  }
};

export const useBackUrl = (defaultUrl: string): string => {
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  if (returnTo && isValidReturnUrl(returnTo)) {
    return returnTo;
  }

  return defaultUrl;
};
