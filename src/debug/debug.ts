import { Api } from "../api/config";
import { CodexValibotIssuesMap } from "../errors/errors";
import { Fetch } from "../fetch-safe/fetch-safe";
import { CodexLogLevel, type CodexDebugInfo } from "./types";
import * as v from "valibot";

export class Debug {
  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Set log level at run time
   */
  setLogLevel(level: CodexLogLevel) {
    const result = v.safeParse(CodexLogLevel, level);

    if (!result.success) {
      return {
        error: true,
        data: {
          message: "Cannot validate the input",
          errors: CodexValibotIssuesMap(result.issues),
        },
      };
    }

    const url =
      this.url +
      Api.config.prefix +
      "/debug/chronicles/loglevel?level=" +
      level;

    return Fetch.safe(url, {
      method: "POST",
      body: "",
    });
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
