import * as v from "valibot";
import type { paths } from "../openapi";

export type CodexLogLevelResponse =
  paths["/debug/chronicles/loglevel"]["post"]["responses"][200]["content"];

export type CodexLogLevel =
  paths["/debug/chronicles/loglevel"]["post"]["parameters"]["query"]["level"];

export const CodexLogLevelInput = v.picklist([
  "TRACE",
  "DEBUG",
  "INFO",
  "NOTICE",
  "WARN",
  "ERROR",
  "FATAL",
]);

export type CodexInfoResponse =
  paths["/debug/info"]["get"]["responses"][200]["content"]["application/json"];

export type CodexDebugInfo = CodexInfoResponse;
