import { Api } from "../api/config";
import { Fetch } from "../fetch-safe/fetch-safe";
import type { SafeValue } from "../values/values";
import type {
  CodexDataResponse,
  CodexManifest,
  CodexNodeSpace,
  DownloadStategy,
  NetworkDownloadResponse,
  UploadResponse,
} from "./types";

export class CodexData {
  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Lists manifest CIDs stored locally in node.
   * TODO: remove the faker data part when the api is ready
   */
  cids(): Promise<SafeValue<CodexDataResponse>> {
    const url = this.url + Api.config.prefix + "/data";

    return Fetch.safeJson<CodexDataResponse>(url, { method: "GET" }).then(
      (data) => {
        if (data.error) {
          return data;
        }

        return { error: false, data: { content: data.data.content } };
      }
    );
  }

  /**
   * Gets a summary of the storage space allocation of the node.
   */
  space() {
    const url = this.url + Api.config.prefix + "/space";

    return Fetch.safeJson<CodexNodeSpace>(url, { method: "GET" });
  }

  /**
   * Upload a file in a streaming manner.
   * Once completed, the file is stored in the node and can be retrieved by any node in the network using the returned CID.
   * XMLHttpRequest is used instead of fetch for this case, to obtain progress information.
   * A callback onProgress can be passed to receive upload progress data information.
   */
  upload(stategy: DownloadStategy): UploadResponse {
    const url = this.url + Api.config.prefix + "/data";

    return {
      result: stategy.download(url),
      abort: () => {
        stategy.abort();
      },
    };
  }

  /**
   * Download a file from the local node in a streaming manner.
   * If the file is not available locally, a 404 is returned.
   */
  async localDownload(cid: string): Promise<SafeValue<Response>> {
    const url = this.url + Api.config.prefix + "/data/" + cid;

    return Fetch.safe(url, { method: "GET" });
  }

  /**
   * Download a file from the network in a streaming manner.
   * If the file is not available locally, it will be retrieved from other nodes in the network if able.
   */
  async networkDownload(
    cid: string
  ): Promise<SafeValue<NetworkDownloadResponse>> {
    const url = this.url + Api.config.prefix + `/data/${cid}/network`;

    return Fetch.safeJson(url, { method: "POST" });
  }

  /**
   * Download a file from the network in a streaming manner.
   * If the file is not available locally, it will be retrieved from other nodes in the network if able.
   */
  async networkDownloadStream(cid: string): Promise<SafeValue<Response>> {
    const url = this.url + Api.config.prefix + `/data/${cid}/network/stream`;

    return Fetch.safe(url, { method: "GET" });
  }

  /**
   * Download only the dataset manifest from the network to the local node
   * if it's not available locally.
   */
  async fetchManifest(cid: string) {
    const url = this.url + Api.config.prefix + `/data/${cid}/network/manifest`;

    return Fetch.safeJson<CodexManifest>(url, { method: "GET" });
  }
}
