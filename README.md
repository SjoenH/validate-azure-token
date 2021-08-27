- Validate your Microsoft Azure-AD issued bearer tokens.
- Can be used in a node environment without access to the `window`-object.

Big thanks to Steve Lathrop for writing this excellent
article https://stevelathrop.net/securing-a-node-js-rest-api-with-azure-ad-jwt-bearer-tokens/

## How to use

```typescript
import validateToken from "validate-azure-token";

const token: string = 'Your bearer token without the "Bearer"-part'
const verifyOptions: VerifyOptions = {
// algorithm: "RS256",
// audience: '...',
// issuer: "...",
// etc... see more down below or refer to jsonwebtoken documentation
}

validateToken(token, verifyOptions).then(() => {
    //Do something on Success
}).catch((error) => {
    //Do something on Error
})
```

### VerifyOptions

We are using jsonwebtoken under the hood. You can find its documentation
here: https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback

```typescript
export interface VerifyOptions {
    algorithms?: Algorithm[] | undefined;
    audience?: string | RegExp | Array<string | RegExp> | undefined;
    clockTimestamp?: number | undefined;
    clockTolerance?: number | undefined;
    /** return an object with the decoded `{ payload, header, signature }` instead of only the usual content of the payload. */
    complete?: boolean | undefined;
    issuer?: string | string[] | undefined;
    ignoreExpiration?: boolean | undefined;
    ignoreNotBefore?: boolean | undefined;
    jwtid?: string | undefined;
    /**
     * If you want to check `nonce` claim, provide a string value here.
     * It is used on Open ID for the ID Tokens. ([Open ID implementation notes](https://openid.net/specs/openid-connect-core-1_0.html#NonceNotes))
     */
    nonce?: string | undefined;
    subject?: string | undefined;
    /**
     * @deprecated
     * Max age of token
     */
    maxAge?: string | undefined;
}
```
