import { Api } from "../api/config";
import {
  Fetch,
  FetchAuthBuilder,
  type FetchAuth,
} from "../fetch-safe/fetch-safe";
import type { SafeValue } from "../values/values";
import type { CodexSpr } from "./types";

type CodexNodeOptions = {
  auth?: FetchAuth;
};

export class CodexNode {
  readonly url: string;
  readonly auth: FetchAuth = {};

  constructor(url: string, options?: CodexNodeOptions) {
    this.url = url;

    if (options?.auth) {
      this.auth = options.auth;
    }
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
      this.url + Api.config.prefix + `/connect/${peerId}?` + params.toString();

    return Fetch.safe(url, {
      method: "GET",
      headers: FetchAuthBuilder.build(this.auth),
    });
  }

  /**
   * Get Node's SPR
   */
  async spr(): Promise<SafeValue<CodexSpr>> {
    const url = this.url + Api.config.prefix + "/spr";

    return Fetch.safeJson(url, {
      method: "GET",
      headers: FetchAuthBuilder.build(this.auth),
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
      headers: FetchAuthBuilder.build(this.auth),
    });
  }
}
