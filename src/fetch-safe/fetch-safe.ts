import { SafeValue } from "../values/values"

export const Fetch = {
	async safe<T extends Object>(url: string, init: RequestInit): Promise<SafeValue<T>> {
		const res = await fetch(url, init)

		if (!res.ok) {
			const message = await res.text()

			return {
				error: true,
				data: {
					type: "api",
					message,
					status: res.status
				}
			}
		}

		try {
			const json = await res.json()

			return { error: false, data: json }
		} catch (e) {
			return {
				error: true,
				data: {
					type: "error",
					message: e instanceof Error ? e.message : "JSON parsing error :" + e
				}
			}
		}
	}
}
