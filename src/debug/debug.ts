import { Api } from "../api/config";
import { CodexError, CodexValibotIssuesMap } from "../errors/errors";
import { Fetch } from "../fetch-safe/fetch-safe";
import type { SafeValue } from "../values/values";
import {
  CodexLogLevelInput,
  type CodexDebugInfo,
  type CodexInfoResponse,
  type CodexLogLevel,
} from "./types";
import * as v from "valibot";

export class CodexDebug {
  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Set log level at run time
   */
  async setLogLevel(level: CodexLogLevel): Promise<SafeValue<string>> {
    const result = v.safeParse(CodexLogLevelInput, level);

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

    return Fetch.safeText(url, {
      method: "POST",
      body: "",
    });
  }

  /**
   * Gets node information
   */
  info(): Promise<SafeValue<CodexDebugInfo>> {
    const url = this.url + Api.config.prefix + `/debug/info`;

    return Fetch.safeJson<CodexInfoResponse>(url, {
      method: "GET",
    });
  }
}
