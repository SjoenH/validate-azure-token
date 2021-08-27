import jwt, {VerifyOptions} from 'jsonwebtoken';
import fetch from 'node-fetch';
import atob from 'atob';

let possibleKeys: { x5c: string; x5t: string }[] = [];
// This list is probably only correct for 24 hours. Let's clear the cache every 12 hours to be on the safe side...
setInterval(() => (possibleKeys = []), 1000 * 60 * 60 * 12);

async function getMatchingKey(token: string): Promise<{ x5c: string; x5t: string } | undefined> {
    // We probably don't need to do this for every request... so let's cache it!
    if (possibleKeys.length === 0) {
        // Get keys from microsoft
        const request = await fetch('https://login.microsoftonline.com/common/discovery/keys');
        const data = await request.json();
        possibleKeys = data.keys.map((key: { x5c: string; x5t: string }) => ({
            x5c: key.x5c,
            x5t: key.x5t,
        }));
    }
    const jwtTokenHeader = JSON.parse(atob(token.split('.')[0]));
    // Cross-Reference Azure AD-Issued Token to get the Correct Public Key
    return possibleKeys.find((key) => key.x5t === jwtTokenHeader.x5t);
}

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

        const publicKey = '-----BEGIN CERTIFICATE-----\n' + matchingKey.x5c + '\n-----END CERTIFICATE-----';

        if (verifyOptions) {
            jwt.verify(token, publicKey, verifyOptions, (err) => {
                if (err) {
                    return reject(err.message);
                } else {
                    return resolve(true);
                }
            });
        } else {
            jwt.verify(token, publicKey, (err) => {
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
