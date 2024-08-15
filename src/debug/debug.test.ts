import assert from "assert";
import { describe, it } from "node:test";
import { Fetch } from "../fetch-safe/fetch-safe";
import { Debug } from "./debug";
import type { CodexLogLevel } from "./types";

describe("debug", () => {
  const debug = new Debug("http://localhost:3000");

  it("returns an error when trying to setup the log level with a bad value", async () => {
    const response = await debug.setLogLevel("TEST" as CodexLogLevel);

    assert.deepStrictEqual(response, {
      error: true,
      data: {
        message: "Cannot validate the input",
        errors: [
          {
            expected:
              '"TRACE" | "DEBUG" | "INFO" | "NOTICE" | "WARN" | "ERROR" | "FATAL"',
            message:
              'Invalid type: Expected "TRACE" | "DEBUG" | "INFO" | "NOTICE" | "WARN" | "ERROR" | "FATAL" but received "TEST"',
            path: undefined,
            received: '"TEST"',
          },
        ],
      },
    });
  });

  it("returns a success when trying to setup the log level with a correct value", async (t) => {
    t.mock.method(Fetch, "safe", () =>
      Promise.resolve({ error: false, data: true })
    );

    const response = await debug.setLogLevel("ERROR");

    assert.deepStrictEqual(response, { error: false, data: true });
  });
});
