import { Api } from "../api/config";
import { CodexError, CodexValibotIssuesMap } from "../errors/errors";
import { Fetch } from "../fetch-safe/fetch-safe";
import type { SafeValue } from "../values/values";
import { CodexLogLevel, type CodexDebugInfo } from "./types";
import * as v from "valibot";

export class CodexDebug {
  readonly url: string;

  constructor(url: string) {
    this.url = url;
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
    });
  }
}
