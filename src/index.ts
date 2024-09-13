import { CodexData } from "./data/data";
import { CodexNode } from "./node/node";
import { CodexMarketplace } from "./marketplace/marketplace";
import { CodexDebug } from "./debug/debug";

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

  get marketplace() {
    if (this._marketplace) {
      return this._marketplace;
    }

    this._marketplace = new CodexMarketplace(this.url);

    return this._marketplace;
  }

  get data() {
    if (this._data) {
      return this._data;
    }

    this._data = new CodexData(this.url);

    return this._data;
  }

  get node() {
    if (this._node) {
      return this._node;
    }

    this._node = new CodexNode(this.url);

    return this._node;
  }

  get debug() {
    if (this._debug) {
      return this._debug;
    }

    this._debug = new CodexDebug(this.url);

    return this._debug;
  }
}
