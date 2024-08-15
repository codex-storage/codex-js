import { Api } from "../api/config";
import { Fetch } from "../fetch-safe/fetch-safe";

export class Node {
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
   * TODO check result
   */
  spr() {
    const url = this.url + Api.config.prefix + "/spr";

    return Fetch.safe(url, {
      method: "GET",
    });
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
