import assert from "assert";
import { afterEach, describe, it, vi } from "vitest";
import { Fetch } from "../fetch-safe/fetch-safe";

class MockResponse implements Response {
  headers: Headers = new Headers();
  ok: boolean;
  redirected = false;
  status: number;
  statusText = "";
  type = "basic" as "basic";
  url = "";
  body = null;
  bodyUsed = false;
  _text: string;

  constructor(ok: boolean, status: number, text: string) {
    this.ok = ok;
    this.status = status;
    this._text = text;
  }

  clone(): Response {
    throw new Error("Method not implemented.");
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    throw new Error("Method not implemented.");
  }

  blob(): Promise<Blob> {
    throw new Error("Method not implemented.");
  }

  formData(): Promise<FormData> {
    throw new Error("Method not implemented.");
  }

  json(): Promise<any> {
    return Promise.resolve(JSON.parse(this._text));
  }

  text(): Promise<string> {
    return Promise.resolve(this._text);
  }
}

describe.only("fetch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns an error when the http call failed", async () => {
    const spy = vi.spyOn(global, "fetch");
    spy.mockImplementationOnce(() =>
      Promise.resolve(new MockResponse(false, 500, "error"))
    );

    const result = await Fetch.safeJson("http://localhost:3000/some-url", {
      method: "GET",
    });

    const error = {
      message: "error",
      code: 500,
    };

    assert.deepStrictEqual(result, { error: true, data: error });
  });

  it.only("returns an error when the json parsing failed", async () => {
    const spy = vi.spyOn(global, "fetch");
    spy.mockImplementationOnce(() =>
      Promise.resolve(
        new MockResponse(false, 200, "Unexpected end of JSON input")
      )
    );

    const result = await Fetch.safeJson("http://localhost:3000/some-url", {
      method: "GET",
    });

    assert.ok(result.error);
    assert.deepStrictEqual(result.data.message, "Unexpected end of JSON input");
  });

  it("returns the data when the fetch succeed", async () => {
    const spy = vi.spyOn(global, "fetch");
    spy.mockImplementationOnce(() =>
      Promise.resolve(
        new MockResponse(true, 200, JSON.stringify({ hello: "world" }))
      )
    );

    const result = await Fetch.safeJson("http://localhost:3000/some-url", {
      method: "GET",
    });

    assert.deepStrictEqual(result, { error: false, data: { hello: "world" } });
  });
});
