import type { CodexLogLevel } from "./types";
import { type FetchAuth } from "../fetch-safe/fetch-safe";
import { Throwable } from "../throwable/throwable";
import { CodexDebug } from "./debug";

type CodexDebugThrowableOptions = {
  auth?: FetchAuth;
};

export class CodexDebugThrowable {
  readonly debug: CodexDebug;

  constructor(url: string, options?: CodexDebugThrowableOptions) {
    this.debug = new CodexDebug(url, options);
  }

  setLogLevel = (level: CodexLogLevel) =>
    Throwable.from(this.debug.setLogLevel(level));
  info = () => Throwable.from(this.debug.info());
}
