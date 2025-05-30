import type { CodexPeerIdContentType, CodexSprContentType } from "./types";
import { type FetchAuth } from "../fetch-safe/fetch-safe";
import { Throwable } from "../throwable/throwable";
import { CodexNode } from "./node";

type CodexNodeThrowableOptions = {
  auth?: FetchAuth;
};

export class CodexNodeThrowable {
  readonly node: CodexNode;

  constructor(url: string, options?: CodexNodeThrowableOptions) {
    this.node = new CodexNode(url, options);
  }

  connect = (peerId: string, addrs: string[] = []) =>
    Throwable.from(this.node.connect(peerId, addrs));
  spr = (type: CodexSprContentType = "json") =>
    Throwable.from(this.node.spr(type));
  peerId = (type: CodexPeerIdContentType = "json") =>
    Throwable.from(this.node.peerId(type));
}
