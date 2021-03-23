# Opacity Account Management

## Example

```ts
import { createMnemonic, mnemonicToHandle } from "../ts-client-library/packages/util/src/mnemonic"
import { WebAccountMiddleware, WebNetworkMiddleware } from "../ts-client-library/packages/middleware-web"

const storageNode = "http://broker-1.opacitynodes.com:3000"

const mnemonic = await createMnemonic()
const handle = await mnemonicToHandle(mnemonic)

const cryptoMiddleware = new WebAccountMiddleware({ asymmetricKey: handle })
const netMiddleware = new WebNetworkMiddleware()

const account = new Account({ crypto: cryptoMiddleware, net: netMiddleware, storageNode })

const invoice = await account.signUp({ size: 10 })
console.log(invoice)
await account.waitForPayment()

console.log(await account.info())
```
