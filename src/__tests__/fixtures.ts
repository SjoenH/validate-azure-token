import jwt from 'jsonwebtoken';

/**
 * RSA private key (PKCS#8) for signing test tokens.
 */
export const TEST_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDH/9WypcP0z+Hk
A9q3KahEhLgXEHCOB+0WFRAmpsDSqad32bq020F7f6GoSS1iUjebmAla67Tz6gJt
A3or9XpSFABSjXcSv5RAwp3qtktPcbBUP90aoxF9wJJTrVx3mGtwbpJvlwy01RiH
dE3y47Y86RfWer9falZ3grlxfPHy9oALZ6oGP3Pkuvw+SliU6F5UNzekj886YbBp
PIFnc92ZlsdameFO0qbLLLGNn23qR1CZjOgZrXzEtNc90quMygtE1QPEhnifFcxP
dzN+MNRmiyNbHsm08yY30cIpDz7CDUNAEDfqc3aCj84o5ZbK/deDgZWDCm+UQb/N
cUE3qK2FAgMBAAECggEAB0RRMjLKNjK4eTW3pHiXw9eTrcjb4hlBINCGm/TqpCzk
aBsp6MjfrfpS+B+ijcRBf36MdniChGtQB8B816yNc36FDXrU5QI/g4Pew4i4n0wY
9VK1uLJMoCZXWsF9jt3jp3vpB7N0E3z7rW5JJ8Zk2H06r8EZg4DEYAbIsKoyy1pf
lIqvRcFoMjTFS+BP353syE/49fuoE9jZeGK54uiumdj6rC8rKEmxXKZYTEIYfyYz
fWEXukNm77Jshmi6HvxSQeldSTChG/lXgBet2Dl1MYiTr7er0pSHxjssApuZYQXV
2JgFaKNWGC87tCvNlMwezkBRdl+rL9stJdodRNw+cQKBgQDpmRKlOac2+uhdZejb
RFGAn0CweisTEBFAgXyJ3sTXRMh6+MH1zlmRRzzKSodeJYhwpVQxLlM0xIOVrT3T
xlSUlOo48teOV64I4A3CK+zDBtq8Ah4nT1sryNOv95krrx4ohYAPdoXYyWxjahfD
FP5jT3KQeqzCfvhKJRkS9uc98QKBgQDbLecPO9g8hmH674ltoGF/9mg2s6PO2Bs9
s4jJbQwSErwFJDt875++UU5hYOJ+9S7T9VdsTGPok/mmvxPpklMJDyeliQt5Fxz+
0BFf6miuw6sBNi+HoKhO2hMkrl9B9ek7hp/2EaQOfs7EfyjN3i8Dtie5I6iTJP9j
HBLu9hBk1QKBgCNZ9QZoKTQa2Jt51rmIJ0Vt1F5gvrAN2G6Iqg47VlK1qBlkGAZZ
ChkATOTYTpAi4fkaLBmdRx5PNxKpuxeXhilON/wSVCjIgB/7uFlQSG5jVSrqryGH
0uZXaCHTOKzxvYCoY27zouHh6bNJ1PrC7JSe61mOFyMAEBc4cgj6sJghAoGBAIeg
jfyFQbeiSHspQtdNiUfPyIkg/FqAq8qwkBJkojWE1kgwNYeIGEeCtIfZlg6N1d5f
USu40ZIYD0I5ty6v1yYh9JyggzL5NH4Rbs71lLWgau8jAqJgrgWtOG9YX6XHb/3f
vphcLjKyEWzSawOJW3pme4o7IJN9L3O66ZRpO5fJAoGALNC+B6+hRxNyM+I/h8NS
S+6Zz8RMKUKpo8ekMj9/acu88oFh+amO5xqOJ5Fr2/mVluFnQ8K7SVteINgoxHZs
K205kdaC050sXX3zLR1AR7vBvtb+3kdBSawx1sn+c0smUBV+hEdA9V3XhZ4ca0pz
FLq+D7Ai2zHls6mKoP2mWsQ=
-----END PRIVATE KEY-----`;

/**
 * Base64-encoded DER certificate (the x5c field value as returned by Azure JWKS).
 * Matches TEST_PRIVATE_KEY.
 */
export const TEST_X5C =
  'MIICpTCCAY0CFC+0mLedaPn/qnCCbowrilwmMgYxMA0GCSqGSIb3DQEBCwUAMA8x' +
  'DTALBgNVBAMMBHRlc3QwHhcNMjYwNjA0MTg1ODAzWhcNMzYwNjAxMTg1ODAzWjAP' +
  'MQ0wCwYDVQQDDAR0ZXN0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA' +
  'x//VsqXD9M/h5APatymoRIS4FxBwjgftFhUQJqbA0qmnd9m6tNtBe3+hqEktYlI3' +
  'm5gJWuu08+oCbQN6K/V6UhQAUo13Er+UQMKd6rZLT3GwVD/dGqMRfcCSU61cd5hr' +
  'cG6Sb5cMtNUYh3RN8uO2POkX1nq/X2pWd4K5cXzx8vaAC2eqBj9z5Lr8PkpYlOhe' +
  'VDc3pI/POmGwaTyBZ3PdmZbHWpnhTtKmyyyxjZ9t6kdQmYzoGa18xLTXPdKrjMoL' +
  'RNUDxIZ4nxXMT3czfjDUZosjWx7JtPMmN9HCKQ8+wg1DQBA36nN2go/OKOWWyv3X' +
  'g4GVgwpvlEG/zXFBN6ithQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQBV16mcpjO/' +
  'XtjL06guGhsaOXMEdiBAmcAmRk5XoCEhWkZPfiJ/dOhXpXnzT7k4+nuZqt2ZC8NA' +
  'IrvgU1YN1UnelL8RAjlmUIKzTcb7kRuk5tvbe+ikt3Z0c3MdU5bdtbttpVCdEhPr' +
  '0h0lpH4HE+kGfFwKg7UcTjMig2rAFGxTwYrdrNm1DPGZzyFQRGM1zmCW95Pu1w8D' +
  '47zNJYT71dovAh3FOBS/PoGj1upzJ6qxaCHjk5fEzuf9KK4pqS0rrQv37aIheZG1' +
  'kdvlnzOuPiGnfu9scAKpnXRZ7a5/Pg6Q42PC/UfkD/nGpW8Nj2JDHf1U4vNjPmdH' +
  'xIC6AfyEKU7H';

/**
 * SHA-1 thumbprint (x5t) of TEST_X5C. Used in JWT headers to reference the key.
 */
export const TEST_X5T = '07j79OKOJdjRGaJh0PMqB4Lt4kE';

/**
 * Sign a test JWT using the test RSA private key.
 */
export function signTestToken(
  payload: Record<string, unknown> = {},
  options: jwt.SignOptions = {},
): string {
  return jwt.sign(payload, TEST_PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: '1h',
    ...options,
  });
}

/**
 * Build a minimal (unsigned) JWT string whose header carries the given x5t value.
 * Useful for testing key-lookup logic without real signatures.
 */
export function makeUnsignedToken(x5t: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', x5t })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: 'test' })).toString('base64url');
  return `${header}.${payload}.fakesig`;
}
