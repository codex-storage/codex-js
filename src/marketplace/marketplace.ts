import { Value } from '@sinclair/typebox/value'
import { Api } from "../api/config"
import { CodexValidationErrors } from '../errors/errors'
import { Fetch } from "../fetch-safe/fetch-safe"
import { SafeValue } from "../values/values"
import { CodexAvailability, CodexAvailabilityCreateResponse, CodexCreateAvailabilityInput, CodexCreateStorageRequestInput, CodexCreateStorageRequestResponse, CodexPurchase, CodexReservation, CodexSlot, CodexUpdateAvailabilityInput } from "./types"

export class Marketplace {
	readonly url: string

	constructor(url: string) {
		this.url = url
	}

	/**
	 * Returns active slots
	 */
	async activeSlots(): Promise<SafeValue<CodexSlot[]>> {
		const url = this.url + Api.config.prefix + "/sales/slots"

		return Fetch.safe<CodexSlot[]>(url, {
			method: "GET"
		})
	}

	/**
	 * Returns active slot with id {slotId} for the host
	 */
	async activeSlot(slotId: string): Promise<SafeValue<CodexSlot>> {
		const url = this.url + Api.config.prefix + "/sales/slots/" + slotId

		return Fetch.safe<CodexSlot>(url, {
			method: "GET"
		})
	}

	/**
	 * Returns storage that is for sale
	 */
	async availabilities(): Promise<SafeValue<CodexAvailability[]>> {
		const url = this.url + Api.config.prefix + "/sales/availability"

		return Fetch.safe<CodexAvailability[]>(url, {
			method: "GET"
		})
	}

	/**
	 * Offers storage for sale
	 */
	async createAvailability(input: CodexCreateAvailabilityInput)
		: Promise<SafeValue<CodexAvailabilityCreateResponse>> {
		const cleaned = Value.Clean(CodexCreateAvailabilityInput, input)

		if (!Value.Check(CodexCreateAvailabilityInput, cleaned)) {
			const iterator = Value.Errors(CodexCreateAvailabilityInput, cleaned)

			return {
				error: true,
				data: {
					type: "validation",
					message: "Cannot validate the input",
					errors: CodexValidationErrors.map(iterator)
				}
			}
		}

		const url = this.url + Api.config.prefix + "/sales/availability"

		return Fetch.safe<CodexAvailabilityCreateResponse>(url, {
			method: "POST",
			headers: {
				"content-type": "application/json"
			},
			body: JSON.stringify(cleaned)
		})
	}

	/**
	 * The new parameters will be only considered for new requests. 
	 * Existing Requests linked to this Availability will continue as is.
	 */
	async updateAvailability(input: CodexUpdateAvailabilityInput): Promise<SafeValue<CodexAvailability>> {
		const cleaned = Value.Clean(CodexUpdateAvailabilityInput, input)

		if (!Value.Check(CodexUpdateAvailabilityInput, cleaned)) {
			const iterator = Value.Errors(CodexUpdateAvailabilityInput, cleaned)

			return {
				error: true,
				data: {
					type: "validation",
					message: "Cannot validate the input",
					errors: CodexValidationErrors.map(iterator)
				}
			}
		}

		const url = this.url + Api.config.prefix + "/sales/availability/" + cleaned.id

		return Fetch.safe<CodexAvailability>(url, {
			method: "POST",
			headers: {
				"content-type": "application/json"
			},
			body: JSON.stringify(cleaned)
		})
	}

	/**
	 * Return's list of Reservations for ongoing Storage Requests that the node hosts.
	 */
	async reservations(availabilityId: string): Promise<SafeValue<CodexReservation[]>> {
		const url = this.url + Api.config.prefix + `/sales/availability/${availabilityId}/reservations`

		return Fetch.safe<CodexReservation[]>(url, {
			method: "GET"
		})
	}

	/**
	 * Returns list of purchase IDs
	 */
	async purchaseIds(): Promise<SafeValue<string[]>> {
		const url = this.url + Api.config.prefix + `/storage/purchases`

		return Fetch.safe<string[]>(url, {
			method: "GET"
		})
	}

	/**
	 * Returns purchase details
	 */
	async purchaseDetail(purchaseId: string): Promise<SafeValue<CodexPurchase>> {
		const url = this.url + Api.config.prefix + `/storage/purchases/` + purchaseId

		return Fetch.safe<CodexPurchase>(url, {
			method: "GET"
		})
	}

	/**
	 * Creates a new request for storage.
	 */
	async createStorageRequest(input: CodexCreateStorageRequestInput): Promise<SafeValue<CodexCreateStorageRequestResponse>> {
		const cleaned = Value.Clean(CodexCreateStorageRequestInput, input)

		if (!Value.Check(CodexCreateStorageRequestInput, cleaned)) {
			const iterator = Value.Errors(CodexCreateStorageRequestInput, cleaned)

			return {
				error: true,
				data: {
					type: "validation",
					message: "Cannot validate the input",
					errors: CodexValidationErrors.map(iterator)
				}
			}
		}

		const { cid, ...body } = cleaned
		const url = this.url + Api.config.prefix + "/storage/request/" + cid

		return Fetch.safe<CodexCreateStorageRequestResponse>(url, {
			method: "POST",
			headers: {
				"content-type": "application/json"
			},
			body: JSON.stringify(body)
		})
	}
}
