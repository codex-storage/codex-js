import { afterEach, assert, describe, it, vi } from "vitest";
import { CodexDebug } from "./debug";
import type { CodexLogLevel } from "./types";
import { CodexError } from "../errors/errors";

describe("debug", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const debug = new CodexDebug("http://localhost:3000");

  it("returns an error when trying to setup the log level with a bad value", async () => {
    const response = await debug.setLogLevel("TEST" as CodexLogLevel);

    assert.deepStrictEqual(response, {
      error: true,
      data: new CodexError("Cannot validate the input", {
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
      }),
    });
  });

  it("returns a success when trying to setup the log level with a correct value", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      text: async () => "",
    } as Response;
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const response = await debug.setLogLevel("ERROR");

    assert.deepStrictEqual(response, { error: false, data: "" });
  });
});
