import { Disk } from "./disk/disk";
import { Marketplace } from "./marketplace/marketplace";

export * from "./fetch-safe/fetch-safe";
export * from "./marketplace/types";

export class Codex {
	readonly url: string
	readonly marketplace: Marketplace
	readonly disk: Disk

	constructor(url: string) {
		this.url = url
		this.marketplace = new Marketplace(url)
		this.disk = new Disk(url)
	}
}

