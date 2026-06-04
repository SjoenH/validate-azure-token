import { makeUnsignedToken, TEST_X5C, TEST_X5T } from './fixtures';

// The mock for node-fetch is set up fresh per test via jest.doMock + jest.resetModules().
// This is necessary because getMatchingKey.ts has module-level state (the key cache).

type GetMatchingKeyFn = (token: string) => Promise<{ x5c: string; x5t: string } | undefined>;

describe('getMatchingKey', () => {
  let getMatchingKey: GetMatchingKeyFn;
  let mockFetch: jest.Mock;

  const AZURE_KEYS_URL = 'https://login.microsoftonline.com/common/discovery/keys';

  beforeEach(() => {
    jest.resetModules();
    mockFetch = jest.fn();
    jest.doMock('node-fetch', () => ({ __esModule: true, default: mockFetch }));
    ({ getMatchingKey } = require('../getMatchingKey') as { getMatchingKey: GetMatchingKeyFn });
  });

  describe('happy path', () => {
    it('fetches Azure keys on first call and returns the matching key', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          keys: [{ x5c: [TEST_X5C], x5t: TEST_X5T }],
        }),
      });

      const token = makeUnsignedToken(TEST_X5T);
      const result = await getMatchingKey(token);

      expect(result).toEqual({ x5c: TEST_X5C, x5t: TEST_X5T });
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(AZURE_KEYS_URL);
    });

    it('returns undefined when no key in the Azure response matches the token x5t', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          keys: [{ x5c: [TEST_X5C], x5t: 'different-thumbprint' }],
        }),
      });

      const token = makeUnsignedToken(TEST_X5T);
      const result = await getMatchingKey(token);

      expect(result).toBeUndefined();
    });

    it('caches keys and skips re-fetching on subsequent calls', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          keys: [{ x5c: [TEST_X5C], x5t: TEST_X5T }],
        }),
      });

      const token = makeUnsignedToken(TEST_X5T);
      await getMatchingKey(token);
      await getMatchingKey(token);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('skips malformed keys in the Azure response and still returns valid ones', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          keys: [
            { x5c: 'not-an-array', x5t: 'bad-key' },
            { x5t: 'missing-x5c' },
            { x5c: [TEST_X5C], x5t: TEST_X5T },
          ],
        }),
      });

      const token = makeUnsignedToken(TEST_X5T);
      const result = await getMatchingKey(token);

      expect(result).toEqual({ x5c: TEST_X5C, x5t: TEST_X5T });
    });
  });

  describe('error handling', () => {
    it('throws when the Azure endpoint returns a non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

      const token = makeUnsignedToken(TEST_X5T);

      await expect(getMatchingKey(token)).rejects.toThrow(
        'Unable to fetch Azure signing keys: 503',
      );
    });

    it('throws when the Azure response has no keys array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ something: 'unexpected' }),
      });

      const token = makeUnsignedToken(TEST_X5T);

      await expect(getMatchingKey(token)).rejects.toThrow(
        'Azure signing key response was invalid',
      );
    });

    it('throws when the JWT token has fewer than two parts', async () => {
      // No network call expected — the token is rejected before fetching.
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ keys: [] }),
      });

      await expect(getMatchingKey('not-a-jwt')).rejects.toThrow('Invalid JWT token format');
    });

    it('throws when the network request itself fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const token = makeUnsignedToken(TEST_X5T);

      await expect(getMatchingKey(token)).rejects.toThrow('Network error');
    });
  });
});
