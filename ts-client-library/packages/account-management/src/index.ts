import { CryptoMiddleware, NetworkMiddleware } from "@opacity/middleware"
import { extractPromise } from "@opacity/util/src/promise"
import { getPayload } from "@opacity/util/src/payload"

export type AccountPlanInfo = {
	name: string
	cost: number
	costInUSD: number
	storageInGB: number
	maxFolders: number
	maxMetadataSizeInMB: number
}

export type AccountPlansRes = {
	plans: {
		[key: number]: AccountPlanInfo
	}
}

export type AccountCreationPayload = {
	durationInMonths: number
	storageLimit: number
}

export type AccountCreationInvoice = {
	cost: number
	ethAddress: string
}

export type AccountCreationRes = {
	expirationDate: number
	invoice: AccountCreationInvoice
}

export type AccountGetData = {
	createdAt: number
	updatedAt: number
	expirationDate: number
	// number of months in their subscription
	monthsInSubscription: number
	// how much storage they are allowed, in GB
	storageLimit: number
	// how much storage they have used, in GB
	storageUsed: number
	// the eth address they will send payment to
	ethAddress: string
	cost: number
	apiVersion: number
	totalFolders: number
	totalMetadataSizeInMB: number
	maxFolders: number
	maxMetadataSizeInMB: number
}

export type AccountGetStripeData = {
	stripePaymentExists: boolean
	chargePaid: boolean
	stripeToken: string
	opctTxStatus: string
	chargeID: string
	amount: number
}

export enum AccountPaymentStatus {
	UNPAID = "unpaid",
	PENDING = "pending",
	PAID = "paid",
	EXPIRED = "expired",
}

export type AccountGetRes = {
	paymentStatus: keyof Record<AccountPaymentStatus, string>
	error: string
	account: AccountGetData
	stripeData: AccountGetStripeData
	invoice?: AccountCreationInvoice
}

export type AccountSignupArgs = {
	size?: number
	duration?: number
}

export type AccountConfig = {
	crypto: CryptoMiddleware
	net: NetworkMiddleware

	storageNode: string
}

export class Account {
	config: AccountConfig

	constructor (config: AccountConfig) {
		this.config = config
	}

	async info (): Promise<AccountGetRes> {
		const payload = await getPayload({ crypto: this.config.crypto, payload: {} })
		const res = await this.config.net.POST<AccountGetRes>(
			this.config.storageNode + "/api/v1/account-data",
			undefined,
			JSON.stringify(payload),
			(body) => new Response(body).json(),
		)

		return res.data
	}

	async plans () {
		const res = await this.config.net.GET(
			this.config.storageNode + "/plans",
			undefined,
			undefined,
			(body) => new Response(body).json() as Promise<AccountPlansRes>,
		)

		// TODO: add filter for custom plans
		// filter plan by size to prevent custom plans from showing up
		const plans: AccountPlanInfo[] = Object.values(res.data.plans).filter((plan) => plan.storageInGB <= 2048)

		return plans
	}

	async status (): Promise<AccountPaymentStatus> {
		const info = await this.info()
		return info.paymentStatus
	}

	async signUp ({ size = 128, duration = 12 }: AccountSignupArgs = {}): Promise<AccountCreationInvoice> {
		try {
			const info = await this.info()

			if (info.invoice) {
				return info.invoice
			}
		} catch {}

		const payload = await getPayload<AccountCreationPayload>({
			crypto: this.config.crypto,
			payload: {
				durationInMonths: duration,
				storageLimit: size,
			},
		})
		const res = await this.config.net.POST<AccountCreationRes>(
			this.config.storageNode + "/api/v1/accounts",
			undefined,
			JSON.stringify(payload),
			(body) => new Response(body).json(),
		)

		return res.data.invoice
	}

	async waitForPayment () {
		const [done, resolveDone] = extractPromise<void>()

		let iTime = 2

		const iFn = async () => {
			const status = await this.status()

			if (status == "paid") {
				resolveDone()
			}
			else {
				iTime *= 2
				if (iTime > 10) {
					iTime = 10
				}
				setTimeout(iFn, iTime * 1000)
			}
		}

		setTimeout(iFn, iTime)

		await done
	}
}
