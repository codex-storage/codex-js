import type { SafeValue } from "../values/values"

export class Disk {
    readonly url: string

    constructor(url: string) {
        this.url = url
    }

    async available(): Promise<SafeValue<{ full: number, used: number }>> {
        return {
            error: false,
            data: {
                full: 500,
                used: 200
            }
        }
    }
}
