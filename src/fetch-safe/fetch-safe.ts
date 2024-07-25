import { type SafeValue } from "../values/values";

export const Fetch = {
  async safe<T extends Object>(
    url: string,
    init: RequestInit,
  ): Promise<SafeValue<T>> {
    const res = await fetch(url, init);

    if (!res.ok) {
      const message = await res.text();

      return {
        error: true,
        data: {
          message,
          code: res.status,
        },
      };
    }

    try {
      const json = await res.json();

      return { error: false, data: json };
    } catch (e) {
      const opts = e instanceof Error && e.stack ? { stack: e.stack } : {};
      return {
        error: true,
        data: {
          message: e instanceof Error ? e.message : "JSON parsing error :" + e,
          ...opts,
        },
      };
    }
  },
};
