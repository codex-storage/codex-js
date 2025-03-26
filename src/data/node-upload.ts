import type { Readable } from "node:stream";
import { CodexError } from "../errors/errors";
import type { SafeValue } from "../values/values";
import Undici from "undici";
import { type FormData } from "undici";
import type { UploadStategy } from "./types";

export class NodeUploadStategy implements UploadStategy {
  private readonly body:
    | string
    | Buffer
    | Uint8Array
    | null
    | Readable
    | FormData;
  private readonly metadata:
    | { filename?: string; mimetype?: string }
    | undefined;
  private abortController: AbortController | undefined;

  constructor(
    body: string | Buffer | Uint8Array | null | Readable | FormData,
    metadata?: { filename?: string; mimetype?: string }
  ) {
    this.body = body;
    this.metadata = metadata;
  }

  async download(url: string): Promise<SafeValue<string>> {
    const headers: Record<string, string> = {};

    if (this.metadata?.filename) {
      headers["Content-Disposition"] =
        'attachment; filename="' + this.metadata?.filename + '"';
    }

    if (this.metadata?.mimetype) {
      headers["Content-Type"] = this.metadata?.mimetype;
    }

    const controller = new AbortController();
    this.abortController = controller;

    const res = await Undici.request(url, {
      method: "POST",
      headers,
      body: this.body,
      signal: controller.signal,
    });

    if (res.statusCode < 200 || res.statusCode >= 300) {
      const msg = `The status code is invalid got ${res.statusCode} - ${await res.body.text()} `;
      return {
        error: true,
        data: new CodexError(msg, { code: res.statusCode }),
      };
    }

    return { error: false, data: await res.body.text() };
  }

  abort(): void {
    try {
      this.abortController?.abort();
    } catch (_) {
      // Nothing to do
    }
  }
}
