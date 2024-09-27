import { Api } from "../api/config";
import { CodexError } from "../errors/errors";
import { Fetch } from "../fetch-safe/fetch-safe";
import type { SafeValue } from "../values/values";
import type {
  CodexDataResponse,
  CodexNodeSpace,
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

    return Fetch.safeJson<CodexDataResponse>(url, {
      method: "GET",
    }).then((data) => {
      if (data.error) {
        return data;
      }

      return {
        error: false,
        data: {
          content: data.data.content,
        },
      };
    });
  }

  /**
   * Gets a summary of the storage space allocation of the node.
   */
  space() {
    const url = this.url + Api.config.prefix + "/space";

    return Fetch.safeJson<CodexNodeSpace>(url, {
      method: "GET",
    });
  }

  /**
   * Upload a file in a streaming manner.
   * Once completed, the file is stored in the node and can be retrieved by any node in the network using the returned CID.
   * XMLHttpRequest is used instead of fetch for this case, to obtain progress information.
   * A callback onProgress can be passed to receive upload progress data information.
   */
  upload(
    file: File,
    onProgress?: (loaded: number, total: number) => void
  ): UploadResponse {
    const url = this.url + Api.config.prefix + "/data";

    const xhr = new XMLHttpRequest();

    const promise = new Promise<SafeValue<string>>(async (resolve) => {
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          onProgress?.(evt.loaded, evt.total);
        }
      };

      xhr.open("POST", url, true);

      xhr.send(file);

      xhr.onload = function () {
        if (xhr.status != 200) {
          resolve({
            error: true,
            data: new CodexError(xhr.responseText, {
              code: xhr.status,
            }),
          });
        } else {
          resolve({ error: false, data: xhr.response });
        }
      };

      xhr.onerror = function () {
        resolve({
          error: true,
          data: new CodexError("Something went wrong during the file upload."),
        });
      };
    });

    return {
      result: promise,
      abort: () => {
        xhr.abort();
      },
    };
  }

  /**
   * Download a file from the local node in a streaming manner.
   * If the file is not available locally, a 404 is returned.
   * There result is a readable stream.
   */
  async localDownload(cid: string) {
    const url = this.url + Api.config.prefix + "/data/" + cid;

    const res = await Fetch.safe(url, {
      method: "GET",
      headers: {
        "content-type": "application/octet-stream",
      },
    });

    if (res.error) {
      return res;
    }

    return res.data.body;
  }

  /**
   * Download a file from the network in a streaming manner.
   * If the file is not available locally, it will be retrieved from other nodes in the network if able.
   */
  async networkDownload(cid: string) {
    const url = this.url + Api.config.prefix + `/data/${cid}/network`;

    const res = await Fetch.safe(url, {
      method: "GET",
      headers: {
        "content-type": "application/octet-stream",
      },
    });

    if (res.error) {
      return res;
    }

    return res.data.body;
  }
}
