import { Disk } from "./disk/disk";
import { Marketplace } from "./marketplace/marketplace";

export * from "./fetch-safe/fetch-safe";
export * from "./marketplace/types";

export class Codex {
	readonly url: string
	private _marketplace: Marketplace | null
	readonly disk: Disk

	constructor(url: string) {
		this.url = url
		this._marketplace = null
		this.disk = new Disk(url)
	}

	async marketplace() {
		if (this._marketplace) {
			return this._marketplace
		}

		const module = await import("./marketplace/marketplace")

		this._marketplace = new module.Marketplace(this.url)

		return module.Marketplace
	}
}

