import { Api } from "../api/config";
import type { SafeValue } from "../async";
import { Fetch } from "../fetch-safe/fetch-safe";
import { Promises } from "../promise-safe/promise-safe";

export class CodexNode {
  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Connect to a peer
   * TODO check result
   */
  connect(peerId: string, addrs: string[] = []) {
    const params = new URLSearchParams();

    for (const addr of addrs) {
      params.append("addrs", addr);
    }

    const url =
      this.url + Api.config.prefix + `/connect/${peerId}?` + addrs.toString();

    return Fetch.safe(url, {
      method: "GET",
    });
  }

  /**
   * Get Node's SPR
   */
  async spr(): Promise<SafeValue<string>> {
    const url = this.url + Api.config.prefix + "/spr";

    const res = await Fetch.safe(url, {
      method: "GET",
    });

    if (res.error) {
      return res;
    }

    return await Promises.safe(res.data.text);
  }

  /**
   * Get Node's PeerID
   * TODO check result
   */
  peerId() {
    const url = this.url + Api.config.prefix + "/node/peerid";

    return Fetch.safe(url, {
      method: "GET",
    });
  }
}
