import { CodexError } from "../errors/errors";
import type { SafeValue } from "../values/values";

export const Promises = {
  async safe<T>(promise: () => Promise<T>): Promise<SafeValue<T>> {
    try {
      const result = await promise();

      return { error: false, data: result };
    } catch (e) {
      return {
        error: true,
        data: new CodexError(e instanceof Error ? e.message : "" + e, {
          sourceStack: e instanceof Error ? e.stack || null : null,
        }),
      };
    }
  },
};
