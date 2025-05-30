import { CodexDataThrowable } from "./data/data.throwable";
import { CodexNodeThrowable } from "./node/node.throwable";
import { CodexMarketplaceThrowable } from "./marketplace/marketplace.throwable";
import { CodexDebugThrowable } from "./debug/debug.throwable";
import type { FetchAuth } from "./fetch-safe/fetch-safe";

export * from "./fetch-safe/fetch-safe";
export * from "./marketplace/types";
export * from "./debug/types";
export * from "./data/types";
export * from "./values/values";
export * from "./errors/errors";

export { CodexDebugThrowable } from "./debug/debug.throwable";
export { CodexDataThrowable } from "./data/data.throwable";
export { CodexNodeThrowable } from "./node/node.throwable";
export { CodexMarketplaceThrowable } from "./marketplace/marketplace.throwable";

type CodexProps = {
  auth?: FetchAuth;
};

export class Codex {
  readonly url: string;
  private _marketplace: CodexMarketplaceThrowable | null;
  private _data: CodexDataThrowable | null;
  private _node: CodexNodeThrowable | null;
  private _debug: CodexDebugThrowable | null;
  private readonly auth: FetchAuth = {};

  constructor(url: string, options?: CodexProps) {
    this.url = url;
    this._marketplace = null;
    this._data = null;
    this._node = null;
    this._debug = null;

    if (options?.auth) {
      this.auth = options?.auth;
    }
  }

  get marketplace() {
    if (this._marketplace) {
      return this._marketplace;
    }

    this._marketplace = new CodexMarketplaceThrowable(this.url, {
      auth: this.auth,
    });

    return this._marketplace;
  }

  get data() {
    if (this._data) {
      return this._data;
    }

    this._data = new CodexDataThrowable(this.url, { auth: this.auth });

    return this._data;
  }

  get node() {
    if (this._node) {
      return this._node;
    }

    this._node = new CodexNodeThrowable(this.url, { auth: this.auth });

    return this._node;
  }

  get debug() {
    if (this._debug) {
      return this._debug;
    }

    this._debug = new CodexDebugThrowable(this.url, { auth: this.auth });

    return this._debug;
  }
}
