import type { CodexData } from "./data/data";
import type { CodexNode } from "./node/node";
import { CodexMarketplace } from "./marketplace/marketplace";
import type { CodexDebug } from "./debug/debug";

export * from "./fetch-safe/fetch-safe";
export * from "./marketplace/types";
export * from "./debug/types";
export * from "./data/types";
export * from "./values/values";
export * from "./errors/errors";

export { CodexDebug } from "./debug/debug";
export { CodexData } from "./data/data";
export { CodexNode } from "./node/node";
export { CodexMarketplace } from "./marketplace/marketplace";

export class Codex {
  readonly url: string;
  private _marketplace: CodexMarketplace | null;
  private _data: CodexData | null;
  private _node: CodexNode | null;
  private _debug: CodexDebug | null;

  constructor(url: string) {
    this.url = url;
    this._marketplace = null;
    this._data = null;
    this._node = null;
    this._debug = null;
  }

  async marketplace() {
    if (this._marketplace) {
      return this._marketplace;
    }

    const module = await import("./marketplace/marketplace");

    this._marketplace = new module.CodexMarketplace(this.url);

    return this._marketplace;
  }

  async data() {
    if (this._data) {
      return this._data;
    }

    const module = await import("./data/data");

    this._data = new module.CodexData(this.url);

    return this._data;
  }

  async node() {
    if (this._node) {
      return this._node;
    }

    const module = await import("./node/node");

    this._node = new module.CodexNode(this.url);

    return this._node;
  }

  async debug() {
    if (this._debug) {
      return this._debug;
    }

    const module = await import("./debug/debug");

    this._debug = new module.CodexDebug(this.url);

    return this._debug;
  }
}
