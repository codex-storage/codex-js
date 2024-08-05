import type { SafeValue } from "../values/values";

export const Promises = {
  async safe<T>(promise: () => Promise<T>): Promise<SafeValue<T>> {
    try {
      const result = await promise();

      return { error: false, data: result };
    } catch (e) {
      const opts = e instanceof Error && e.stack ? { stack: e.stack } : {};

      return {
        error: true,
        data: {
          message: e instanceof Error ? e.message : "" + e,
          ...opts,
        },
      };
    }
  },
};
