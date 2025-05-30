import { assert, describe, expect, it, vi } from "vitest";
import { CodexNode } from "./node";
import { Fetch } from "../fetch-safe/fetch-safe";

describe("node", () => {
  const clientUrl = process.env["CLIENT_URL"] || "http://localhost:8080";
  const node = new CodexNode(clientUrl);

  it("gets the json spr", async () => {
    const spr = await node.spr("json");
    assert.ok(spr.error == false);
    assert.ok(spr.data);
  });

  it("gets the text spr", async () => {
    const spr = await node.spr("text");
    assert.ok(spr.error == false);
    assert.ok(spr.data);
  });

  it("connects to a peer", async () => {
    const spy = vi.spyOn(Fetch, "safeText");
    spy.mockImplementationOnce(() =>
      Promise.resolve({ error: false, data: "" })
    );

    await node.connect("1234", ["5678"]);
    expect(spy).toHaveBeenCalledWith(
      clientUrl + "/api/codex/v1/connect/1234?addrs=5678",
      {
        headers: {},
        method: "GET",
      }
    );
  });
});
