declare module "hdkey" {
	type PrivateKey = Buffer
	type PublicKey = Buffer
	type PrivateKeyExtended = string
	type PublicKeyExtended = string

	type KeyJSON = { xpriv: PrivateKeyExtended; xpub: PublicKeyExtended }

	type Versions = { private: number; public: number }

	export default class HDKey {
		versions: Versions
		depth: number
		index: number
		chainCode: Buffer

		readonly fingerprint: number
		readonly identifier: Buffer
		readonly pubKeyHash: Buffer

		privateKey: PrivateKey
		publicKey: PublicKey

		readonly privateKeyExtended: PrivateKeyExtended
		readonly publicKeyExtended: PublicKeyExtended

		constructor (versions?: Versions)

		derive (path: string): HDKey
		deriveChild (index: number): HDKey

		sign (hash: Buffer): Buffer
		verfiy (hash: Buffer, signature: Buffer): boolean

		wipePrivateData (): HDKey

		toJSON (): KeyJSON
	}

	export function fromMasterSeed (seed: Buffer, versions?: Versions): HDKey
	export function fromExtendedKey (key: PrivateKeyExtended, versions: Versions): HDKey
	export function fromJSON (json: KeyJSON): HDKey
}

declare module "hdkey/lib/hdkey" {
	import HDKey, {
		KeyJSON,
		PrivateKey,
		PrivateKeyExtended,
		PublicKey,
		PublicKeyExtended,
		Versions,
		fromExtendedKey,
		fromJSON,
		fromMasterSeed,
	} from "hdkey"
	export default HDKey
	export {
		KeyJSON,
		PrivateKey,
		PrivateKeyExtended,
		PublicKey,
		PublicKeyExtended,
		Versions,
		fromExtendedKey,
		fromJSON,
		fromMasterSeed,
	}
}
