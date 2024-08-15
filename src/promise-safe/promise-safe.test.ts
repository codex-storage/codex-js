import assert from "assert";
import { describe, it } from "node:test";
import { Promises } from "./promise-safe";

describe("promise safe", () => {
  it("returns an error when the promise failed", async () => {
    const result = await Promises.safe(
      () => new Promise((_, reject) => reject("error")),
    );

    assert.deepStrictEqual(result, { error: true, data: { message: "error" } });
  });

  it("returns the value when the promise succeed", async () => {
    const result = await Promises.safe(
      () => new Promise((resolve) => resolve("ok")),
    );

    assert.deepStrictEqual(result, { error: false, data: "ok" });
  });
});
