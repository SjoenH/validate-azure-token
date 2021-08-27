import jwt, {VerifyOptions} from 'jsonwebtoken';
import {getMatchingKey} from "./getMatchingKey";

/**
 * Validate your Azure Bearer Token
 * @param token Without the Bearer text
 * @param verifyOptions
 * @returns {*}
 */
const validateJWTToken = async (token: string, verifyOptions: VerifyOptions | undefined): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        if (!token) {
            return reject('Missing JWT token');
        }
        const matchingKey = await getMatchingKey(token);
        if (!matchingKey) {
            return reject('Token does not match keys');
        }

        const publicKeyCertificate = '-----BEGIN CERTIFICATE-----\n' + matchingKey.x5c + '\n-----END CERTIFICATE-----';

        if (verifyOptions) {
            jwt.verify(token, publicKeyCertificate, verifyOptions, (err) => {
                if (err) {
                    return reject(err.message);
                } else {
                    return resolve(true);
                }
            });
        } else {
            jwt.verify(token, publicKeyCertificate, (err) => {
                if (err) {
                    return reject(err.message);
                } else {
                    return resolve(true);
                }
            });
        }
    });
};

export default validateJWTToken;
