import type { Data } from "./data/data";
import type { Node } from "./node/node";
import { Marketplace } from "./marketplace/marketplace";
import type { Debug } from "./debug/debug";

export * from "./fetch-safe/fetch-safe";
export * from "./marketplace/types";
export * from "./debug/types";
export * from "./data/types";
export * from "./values/values";
export * from "./errors/errors";

export class Codex {
  readonly url: string;
  private _marketplace: Marketplace | null;
  private _data: Data | null;
  private _node: Node | null;
  private _debug: Debug | null;

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

    this._marketplace = new module.Marketplace(this.url);

    return this._marketplace;
  }

  async data() {
    if (this._data) {
      return this._data;
    }

    const module = await import("./data/data");

    this._data = new module.Data(this.url);

    return this._data;
  }

  async node() {
    if (this._node) {
      return this._node;
    }

    const module = await import("./node/node");

    this._node = new module.Node(this.url);

    return this._node;
  }

  async debug() {
    if (this._debug) {
      return this._debug;
    }

    const module = await import("./debug/debug");

    this._debug = new module.Debug(this.url);

    return this._debug;
  }
}
