# Opacity Client Library

## Packages

[`@opacity/account-management`](./packages/account-management) - Account creation, payment, and info

[`@opacity/account-system`](./packages/account-system) - Metadata

[`@opacity/middleware`](./packages/middleware) - Middleware specification

[`@opacity/middleware`](./packages/middleware-stub) - Middleware stubs for testing

[`@opacity/middleware`](./packages/middleware-web) - Cryptography and network for the web

[`@opacity/opaque`](./packages/opaque) - Uploads and downloads

[`@opacity/util`](./packages/util) - Utilities

## Example

Install

```sh
git submodule add -b dev https://github.com/opacity/ts-client-library.git
cd ts-client-library
npx lerna bootstrap
cd ..
```

src/index.ts

```ts
import { Account } from "../ts-client-library/packages/account-management"
import { AccountSystem, MetadataAccess } from "../ts-client-library/packages/account-system"
import { createMnemonic, mnemonicToHandle } from "../ts-client-library/packages/util/src/mnemonic"
import { polyfillReadableStream } from "../ts-client-library/packages/util/src/streams"
import { Upload, bindUploadToAccountSystem } from "../ts-client-library/packages/opaque"
import { WebAccountMiddleware, WebNetworkMiddleware } from "../ts-client-library/packages/middleware-web"

const storageNode = "https://broker-1.opacitynodes.com:3000"

const mnemonic = await createMnemonic()
const handle = await mnemonicToHandle(mnemonic)

const cryptoMiddleware = new WebAccountMiddleware({ asymmetricKey: handle })
const netMiddleware = new WebNetworkMiddleware()

const account = new Account({ crypto: cryptoMiddleware, net: netMiddleware, storageNode })

const invoice = await account.signUp({ size: 10 })
console.log(invoice)
await account.waitForPayment()

console.log(await account.info())

const metadataAccess = new MetadataAccess({
	net: netMiddleware,
	crypto: cryptoMiddleware,
	metadataNode: storageNode,
})
const accountSystem = new AccountSystem({ metadataAccess })

const file = new File([new Blob(["hello world"], { type: "text/plain" })], "hello.txt")
const upload = new Upload({
	config: {
		crypto: cryptoMiddleware,
		net: netMiddleware,
		storageNode: storageNode,
	},
	meta: file,
	name: file.name,
	path: "/",
})

// side effects
bindUploadToAccountSystem(accountSystem, upload)

const stream = await upload.start()
// if there is no error
if (stream) {
	polyfillReadableStream<Uint8Array>(file.stream()).pipeThrough(stream)
}

await upload.finish()
console.log("finish")

console.log(await accountSystem.getFolderMetadataByPath("/"))

const filesIndex = await accountSystem.getFilesIndex()
console.log(filesIndex)

const fsObject = new FileSystemObject(filesIndex.files[0].handle, {
	crypto: cryptoMiddleware,
	net: netMiddleware,
	storageNode,
})

bindDeleteToAccountSystem(accountSystem, fsObject)

await fsObject.delete()

console.log(await accountSystem.getFolderMetadataByPath("/"))
console.log(await accountSystem.getFilesIndex())
```
