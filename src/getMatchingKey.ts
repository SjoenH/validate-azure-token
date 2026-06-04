import fetch from 'node-fetch';

type AzureKey = { x5c: string; x5t: string };
type AzureRawKey = {
  x5c?: unknown;
  x5t?: unknown;
};
type AzureKeySetResponse = {
  keys?: AzureRawKey[];
};

let possibleKeys: AzureKey[] = [];
// This list is probably only correct for 24 hours. Let's clear the cache every 12 hours to be on the safe side...
const clearCacheTimer = setInterval(() => (possibleKeys = []), 1000 * 60 * 60 * 12);
clearCacheTimer.unref?.();

function decodeTokenHeader(token: string): { x5t?: string } {
  const tokenParts = token.split('.');
  if (tokenParts.length < 2 || !tokenParts[0]) {
    throw new Error('Invalid JWT token format');
  }

  const decodedHeader = Buffer.from(tokenParts[0], 'base64url').toString('utf8');
  return JSON.parse(decodedHeader) as { x5t?: string };
}

function isAzureKey(key: AzureRawKey): key is { x5c: string[]; x5t: string } {
  return Array.isArray(key?.x5c) && typeof key.x5c[0] === 'string' && typeof key.x5t === 'string';
}

/**
 * Get the public key that fits the given token.
 * @param token
 */
export async function getMatchingKey(token: string): Promise<AzureKey | undefined> {
  // We probably don't need to do this for every request... so let's cache it!
  if (possibleKeys.length === 0) {
    // Get keys from microsoft
    const request = await fetch('https://login.microsoftonline.com/common/discovery/keys');
    if (!request.ok) {
      throw new Error(`Unable to fetch Azure signing keys: ${request.status}`);
    }

    const data = (await request.json()) as AzureKeySetResponse;
    if (!Array.isArray(data.keys)) {
      throw new Error('Azure signing key response was invalid');
    }

    possibleKeys = data.keys.filter(isAzureKey).map((key) => ({
      x5c: key.x5c[0],
      x5t: key.x5t,
    }));
  }
  const jwtTokenHeader = decodeTokenHeader(token);
  // Cross-Reference Azure AD-Issued Token to get the Correct Public Key
  return possibleKeys.find((key) => key.x5t === jwtTokenHeader.x5t);
}
