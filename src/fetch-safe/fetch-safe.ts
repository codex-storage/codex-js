import { CodexError } from "../errors/errors";
import { Promises } from "../promise-safe/promise-safe";
import { type SafeValue } from "../values/values";

export const Fetch = {
  async safe(url: string, init: RequestInit): Promise<SafeValue<Response>> {
    const res = await Promises.safe(() => fetch(url, init));

    if (res.error) {
      return {
        error: true,
        data: new CodexError(res.data.message, {
          code: 502,
        }),
      };
    }

    if (!res.data.ok) {
      const message = await Promises.safe(() => res.data.text());

      if (message.error) {
        return message;
      }

      return {
        error: true,
        data: new CodexError(message.data, {
          code: res.data.status,
        }),
      };
    }

    return { error: false, data: res.data };
  },

  async safeJson<T extends Object>(
    url: string,
    init: RequestInit
  ): Promise<SafeValue<T>> {
    const res = await this.safe(url, init);

    if (res.error) {
      return res;
    }

    return Promises.safe(() => res.data.json());
  },

  async safeText(url: string, init: RequestInit): Promise<SafeValue<string>> {
    const res = await this.safe(url, init);

    if (res.error) {
      return res;
    }

    return Promises.safe(() => res.data.text());
  },
};
