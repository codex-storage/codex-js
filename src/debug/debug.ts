import { Api } from "../api/config";
import { CodexError, CodexValibotIssuesMap } from "../errors/errors";
import {
  Fetch,
  FetchAuthBuilder,
  type FetchAuth,
} from "../fetch-safe/fetch-safe";
import type { SafeValue } from "../values/values";
import { CodexLogLevel, type CodexDebugInfo } from "./types";
import * as v from "valibot";

type CodexDebugOptions = {
  auth?: FetchAuth;
};

export class CodexDebug {
  readonly url: string;
  readonly auth: FetchAuth = {};

  constructor(url: string, options?: CodexDebugOptions) {
    this.url = url;

    if (options?.auth) {
      this.auth = options.auth;
    }
  }

  /**
   * Set log level at run time
   */
  async setLogLevel(level: CodexLogLevel): Promise<SafeValue<"">> {
    const result = v.safeParse(CodexLogLevel, level);

    if (!result.success) {
      return Promise.resolve({
        error: true,
        data: new CodexError("Cannot validate the input", {
          errors: CodexValibotIssuesMap(result.issues),
        }),
      });
    }

    const url =
      this.url +
      Api.config.prefix +
      "/debug/chronicles/loglevel?level=" +
      level;

    const res = await Fetch.safe(url, {
      method: "POST",
      headers: FetchAuthBuilder.build(this.auth),
      body: "",
    });

    if (res.error) {
      return res;
    }

    return { error: false, data: "" };
  }

  /**
   * Gets node information
   */
  info() {
    const url = this.url + Api.config.prefix + `/debug/info`;

    return Fetch.safeJson<CodexDebugInfo>(url, {
      method: "GET",
      headers: FetchAuthBuilder.build(this.auth),
    });
  }
}
