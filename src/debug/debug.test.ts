import { assert, describe, it } from "vitest";
import { CodexDebug } from "./debug";

describe("debug", () => {
  const debug = new CodexDebug(
    process.env["CLIENT_URL"] || "http://localhost:8080"
  );

  it("changes the log level", async () => {
    const logLevel = await debug.setLogLevel("NOTICE");
    assert.ok(logLevel.error == false);
  });

  it("gets the debug info", async () => {
    const info = await debug.info();
    assert.ok(info.error == false);
    assert.ok(info.data.spr);
    assert.ok(info.data.announceAddresses.length > 0);
  });

  it("returns error when changing the log level with wrong value", async () => {
    const logLevel = await debug.setLogLevel("HELLO");
    assert.ok(logLevel.error);
    assert.strictEqual(logLevel.data.message, "Cannot validate the input");
  });
});
