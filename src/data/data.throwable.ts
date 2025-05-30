import { CodexData } from "./data";
import type { UploadStrategy } from "./types";
import { type FetchAuth } from "../fetch-safe/fetch-safe";
import { Throwable } from "../throwable/throwable";

type CodexDataThrowableOptions = {
  auth?: FetchAuth;
};

export class CodexDataThrowable {
  readonly data: CodexData;

  constructor(url: string, options?: CodexDataThrowableOptions) {
    this.data = new CodexData(url, options);
  }

  cids = () => Throwable.from(this.data.cids());
  space = () => Throwable.from(this.data.space());
  upload = (strategy: UploadStrategy) => {
    const { result, abort } = this.data.upload(strategy);
    return {
      result: Throwable.from(result),
      abort,
    };
  };
  localDownload = (cid: string) => Throwable.from(this.data.localDownload(cid));
  networkDownload = (cid: string) =>
    Throwable.from(this.data.networkDownload(cid));
  networkDownloadStream = (cid: string) =>
    Throwable.from(this.data.networkDownloadStream(cid));
  fetchManifest = (cid: string) => Throwable.from(this.data.fetchManifest(cid));
  delete = (cid: string) => Throwable.from(this.data.delete(cid));
}
