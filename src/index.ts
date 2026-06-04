import jwt, { VerifyOptions } from 'jsonwebtoken';
import { getMatchingKey } from './getMatchingKey';

/**
 * Validate your Azure Bearer Token
 * @param token Without the Bearer text
 * @param verifyOptions
 * @returns {*}
 */
const validateToken = async (token: string, verifyOptions: VerifyOptions = {}): Promise<true> => {
  if (!token) {
    throw new Error('Missing JWT token');
  }

  const matchingKey = await getMatchingKey(token);
  if (!matchingKey) {
    throw new Error('Token does not match Azure signing keys');
  }

  const publicKeyCertificate = `-----BEGIN CERTIFICATE-----\n${matchingKey.x5c}\n-----END CERTIFICATE-----`;
  const resolvedVerifyOptions: VerifyOptions = {
    algorithms: ['RS256'],
    ...verifyOptions,
  };

  return new Promise((resolve, reject) => {
    jwt.verify(token, publicKeyCertificate, resolvedVerifyOptions, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(true);
    });
  });
};

export default validateToken;
