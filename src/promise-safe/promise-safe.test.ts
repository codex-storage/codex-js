import { assert, describe, it } from "vitest";
import { Promises } from "./promise-safe";
import { CodexError } from "../errors/errors";

describe("promise safe", () => {
  it("returns an error when the promise failed", async () => {
    const result = await Promises.safe(
      () => new Promise((_, reject) => reject("error"))
    );

    assert.deepStrictEqual(result, {
      error: true,
      data: new CodexError("error"),
    });
  });

  it("returns the value when the promise succeed", async () => {
    const result = await Promises.safe(
      () => new Promise((resolve) => resolve("ok"))
    );

    assert.deepStrictEqual(result, { error: false, data: "ok" });
  });
});
