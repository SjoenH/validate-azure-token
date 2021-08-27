
Big thanks to Steve Lathrop for writing this exellent article https://stevelathrop.net/securing-a-node-js-rest-api-with-azure-ad-jwt-bearer-tokens/

- [x] Can be used in a node environment without access to the `window`-object.

## How to use

```typescript
    import validateJWTToken from "validate-azure-bearer-token";

const token = 'Your bearer token without the "Bearer"-part'
const verifyOptions = {
// algorithms: ["RS256"],
// audience: '...',
// issuer: "...",
// Take a look at the documentation for jsonwebtoken options: 
// https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback
}

validateJWTToken(token, verifyOptions).then(() => {
    //Do something on Success
}).catch((error) => {
    //Do something on Error
})
```

