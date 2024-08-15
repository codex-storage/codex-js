import { Api } from "../api/config";
import { Fetch } from "../fetch-safe/fetch-safe";
import type { SafeValue } from "../values/values";
import type { CodexDataResponse, CodexNodeSpace } from "./types";

type UploadResponse = {
  result: Promise<SafeValue<string>>;
  abort: () => void;
};

export class Data {
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

      const mimetypes = [
        "image/png",
        "image/jpg",
        "image/jpeg",
        "audio/mp3",
        "video/mp4",
        "application/pdf",
        "application/msdoc",
        "text/plain",
      ];

      return {
        error: false,
        data: {
          content: data.data.content.map((content) => {
            const random = Math.trunc(Math.random() * (mimetypes.length - 1));
            const mimetype = mimetypes[random];
            const [, extension] = mimetype?.split("/") || [];
            const filename = Array(5)
              .fill("")
              .map((_) => ((Math.random() * 36) | 0).toString(36))
              .join("");

            return {
              cid: content.cid,
              manifest: {
                ...content.manifest,
                filename: `${filename}.${extension}`,
                mimetype: mimetype || "",
                uploadedAt: new Date().toJSON(),
              },
            };
          }),
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
  async upload(
    file: File,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<UploadResponse> {
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
            data: {
              code: xhr.status,
              message: xhr.responseText,
            },
          });
        } else {
          resolve({ error: false, data: xhr.response });
        }
      };

      xhr.onerror = function () {
        resolve({
          error: true,
          data: {
            message: "Something went wrong during the file upload.",
          },
        });
      };
    });

    // const promise = Fetch.safe(url, {
    //   method: "POST",
    //   headers: { "Content-Type": "text/plain" },
    //   body: file.stream(),
    //   // @ts-ignore
    //   duplex: "half",
    // })
    //   .then(async (res) => {
    //     console.info(res);
    //     return res.error
    //       ? res
    //       : { error: false as false, data: await res.data.text() };
    //   })

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
