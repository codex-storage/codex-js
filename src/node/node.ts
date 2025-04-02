import { Api } from "../api/config";
import {
  Fetch,
  FetchAuthBuilder,
  type FetchAuth,
} from "../fetch-safe/fetch-safe";
import type { SafeValue } from "../values/values";
import type {
  CodexPeerId,
  CodexPeerIdContentType,
  CodexPeerIdJsonResponse,
  CodexSpr,
  CodexSprContentType,
  CodexSprJsonResponse,
} from "./types";

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
   */
  connect(peerId: string, addrs: string[] = []): Promise<SafeValue<string>> {
    const params = new URLSearchParams();

    for (const addr of addrs) {
      params.append("addrs", addr);
    }

    const url =
      this.url + Api.config.prefix + `/connect/${peerId}?` + params.toString();

    return Fetch.safeText(url, {
      method: "GET",
      headers: FetchAuthBuilder.build(this.auth),
    });
  }

  /**
   * Get Node's SPR
   */
  async spr(
    type: CodexSprContentType = "json"
  ): Promise<SafeValue<CodexSpr<CodexSprContentType>>> {
    const url = this.url + Api.config.prefix + "/spr";

    if (type === "json") {
      return Fetch.safeJson<CodexSprJsonResponse>(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return Fetch.safeText(url, {
      method: "GET",
      headers: {
        "Content-Type": "text/plain",
        ...FetchAuthBuilder.build(this.auth),
      },
    });
  }

  /**
   * Get Node's PeerID
   */
  peerId(
    type: CodexPeerIdContentType = "json"
  ): Promise<SafeValue<CodexPeerId<CodexPeerIdContentType>>> {
    const url = this.url + Api.config.prefix + "/node/peerid";

    if (type === "json") {
      return Fetch.safeJson<CodexPeerIdJsonResponse>(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return Fetch.safeText(url, {
      method: "GET",
      headers: {
        "Content-Type": "text/plain",
        ...FetchAuthBuilder.build(this.auth),
      },
    });
  }
}
