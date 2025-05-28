import { CodexError } from "../errors/errors";
import type { SafeValue } from "../values/values";
import type { UploadStrategy, UploadStrategyOptions } from "./types";

export class BrowserUploadStrategy implements UploadStrategy {
  private readonly file: Document | XMLHttpRequestBodyInit;
  private readonly onProgress:
    | ((loaded: number, total: number) => void)
    | undefined;
  private readonly metadata:
    | { filename?: string; mimetype?: string }
    | undefined;
  private xhr: XMLHttpRequest | undefined;

  constructor(
    file: Document | XMLHttpRequestBodyInit,
    onProgress?: (loaded: number, total: number) => void,
    metadata?: { filename?: string; mimetype?: string }
  ) {
    this.file = file;
    this.onProgress = onProgress;
    this.metadata = metadata;
  }

  upload(
    url: string,
    { auth }: UploadStrategyOptions
  ): Promise<SafeValue<string>> {
    const xhr = new XMLHttpRequest();
    this.xhr = xhr;

    return new Promise<SafeValue<string>>((resolve) => {
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          this.onProgress?.(evt.loaded, evt.total);
        }
      };

      xhr.open("POST", url, true);

      if (this.metadata?.filename) {
        xhr.setRequestHeader(
          "Content-Disposition",
          'attachment; filename="' + this.metadata.filename + '"'
        );
      }

      if (auth?.basic) {
        xhr.setRequestHeader("Authorization", "Basic " + auth.basic);
      }

      if (this.metadata?.mimetype) {
        xhr.setRequestHeader("Content-Type", this.metadata.mimetype);
      }

      xhr.send(this.file);

      xhr.onload = function () {
        if (xhr.status != 200) {
          resolve({
            error: true,
            data: new CodexError(xhr.responseText, { code: xhr.status }),
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
  }

  abort(): void {
    this.xhr?.abort();
  }
}
