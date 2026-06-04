import { generateKeyPairSync } from 'crypto';
import jwt from 'jsonwebtoken';
import validateToken from '../index';
import { getMatchingKey } from '../getMatchingKey';
import { signTestToken, TEST_X5C, TEST_X5T } from './fixtures';

jest.mock('../getMatchingKey');

const mockGetMatchingKey = jest.mocked(getMatchingKey);

/** Default mock: returns the test certificate matching the test RSA key. */
function setupValidKey(): void {
  mockGetMatchingKey.mockResolvedValue({ x5c: TEST_X5C, x5t: TEST_X5T });
}

describe('validateToken', () => {
  describe('input validation', () => {
    it('throws when token is an empty string', async () => {
      await expect(validateToken('')).rejects.toThrow('Missing JWT token');
    });

    it('throws when getMatchingKey returns undefined (no matching Azure key)', async () => {
      mockGetMatchingKey.mockResolvedValue(undefined);

      const token = signTestToken({ sub: 'user1' });

      await expect(validateToken(token)).rejects.toThrow('Token does not match Azure signing keys');
    });
  });

  describe('valid token', () => {
    it('resolves to true for a valid RS256 token', async () => {
      setupValidKey();

      const token = signTestToken({ sub: 'user1' });
      const result = await validateToken(token);

      expect(result).toBe(true);
    });

    it('calls getMatchingKey with the provided token', async () => {
      setupValidKey();

      const token = signTestToken({ sub: 'user1' });
      await validateToken(token);

      expect(mockGetMatchingKey).toHaveBeenCalledTimes(1);
      expect(mockGetMatchingKey).toHaveBeenCalledWith(token);
    });
  });

  describe('invalid / tampered tokens', () => {
    it('rejects an expired token', async () => {
      setupValidKey();

      // Sign a token that expired 10 seconds ago.
      const expiredToken = signTestToken({ sub: 'user1' }, { expiresIn: -10 });

      await expect(validateToken(expiredToken)).rejects.toMatchObject({
        name: 'TokenExpiredError',
      });
    });

    it('rejects a token signed with a different private key', async () => {
      setupValidKey();

      // Generate a fresh RSA key pair — unrelated to TEST_PRIVATE_KEY.
      const { privateKey: otherKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
      const tampered = jwt.sign({ sub: 'user1' }, otherKey, { algorithm: 'RS256' });

      await expect(validateToken(tampered)).rejects.toMatchObject({
        name: 'JsonWebTokenError',
      });
    });
  });

  describe('verifyOptions passthrough', () => {
    it('enforces audience check when audience is specified in options', async () => {
      setupValidKey();

      const token = signTestToken({ sub: 'user1', aud: 'my-app' });

      // Correct audience — should pass.
      await expect(validateToken(token, { audience: 'my-app' })).resolves.toBe(true);

      // Wrong audience — should reject.
      await expect(validateToken(token, { audience: 'other-app' })).rejects.toMatchObject({
        name: 'JsonWebTokenError',
      });
    });

    it('enforces issuer check when issuer is specified in options', async () => {
      setupValidKey();

      // Sign with iss only in the payload — not duplicated in SignOptions.
      const token = signTestToken({ sub: 'user1', iss: 'https://login.microsoftonline.com/tenant' });

      await expect(
        validateToken(token, { issuer: 'https://login.microsoftonline.com/tenant' }),
      ).resolves.toBe(true);

      await expect(
        validateToken(token, { issuer: 'https://other-issuer.example.com' }),
      ).rejects.toMatchObject({ name: 'JsonWebTokenError' });
    });

    it('uses RS256 by default even when no verifyOptions are supplied', async () => {
      setupValidKey();

      const token = signTestToken({ sub: 'user1' });

      // Simply verifying a valid RS256 token without any options should succeed.
      await expect(validateToken(token)).resolves.toBe(true);
    });
  });
});
