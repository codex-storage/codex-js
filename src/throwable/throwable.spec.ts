import { assert, describe, it } from "vitest";
import { CodexDataThrowable } from "../data/data.throwable";
import { CodexError } from "../errors/errors";

describe("data", () => {
  const data = new CodexDataThrowable(
    process.env["CLIENT_URL"] || "http://localhost:8080"
  );

  it("returns an error when providing an invalid cid", async () => {
    try {
      await data.delete("hello");
      assert.fail();
    } catch (e) {
      assert.ok(e instanceof CodexError);
      assert.ok(e.message.includes("Incorrect Cid"));
    }
  });
});
