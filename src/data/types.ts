import type { components, paths } from "../openapi";
import type { SafeValue } from "../values/values";

export type CodexDataResponse =
  paths["/data"]["get"]["responses"][200]["content"]["application/json"];

export type CodexDataItem = components["schemas"]["DataItem"];

export type CodexDataItems = CodexDataResponse;

export type CodexSpaceResponse =
  paths["/space"]["get"]["responses"][200]["content"]["application/json"];

export type CodexNodeSpace = CodexSpaceResponse;

export type UploadResponse = {
  result: Promise<SafeValue<string>>;
  abort: () => void;
};

export type CodexDataNetworkResponse =
  paths["/data/{cid}/network"]["post"]["responses"][200]["content"]["application/json"];

export type CodexNetworkDownload = components["schemas"]["DataItem"];

export type CodexFetchManifestResponse =
  paths["/data/{cid}/network/manifest"]["get"]["responses"][200]["content"]["application/json"];

export type CodexManifest = CodexFetchManifestResponse;

export interface UploadStategy {
  download(url: string): Promise<SafeValue<string>>;
  abort(): void;
}
