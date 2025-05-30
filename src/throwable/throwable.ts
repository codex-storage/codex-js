import type { SafeValue } from "../values/values";

export const Throwable = {
  async from<T>(safePromise: Promise<SafeValue<T>>): Promise<T> {
    const result = await safePromise;

    if (result.error) {
      throw result.data;
    }

    return result.data;
  },
};
