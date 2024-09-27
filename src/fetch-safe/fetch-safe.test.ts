import { afterEach, assert, describe, it, vi } from "vitest";
import { Fetch } from "../fetch-safe/fetch-safe";
import { CodexError } from "../async";

describe.only("fetch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns an error when the http call failed", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      text: async () => "error",
    } as Response;
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const result = await Fetch.safeJson("http://localhost:3000/some-url", {
      method: "GET",
    });

    const error = new CodexError("error", {
      code: 500,
    });

    assert.deepStrictEqual(result, { error: true, data: error });
  });

  it.only("returns an error when the json parsing failed", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => {
        return JSON.parse("{error");
      },
    } as any;
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const result = await Fetch.safeJson("http://localhost:3000/some-url", {
      method: "GET",
    });

    assert.ok(result.error);
  });

  it("returns the data when the fetch succeed", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        hello: "world",
      }),
    } as Response;
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const result = await Fetch.safeJson("http://localhost:3000/some-url", {
      method: "GET",
    });

    assert.deepStrictEqual(result, { error: false, data: { hello: "world" } });
  });
});
