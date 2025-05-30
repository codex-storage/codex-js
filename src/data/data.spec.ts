import { assert, describe, it } from "vitest";
import { CodexData } from "./data";
import { NodeUploadStategy } from "./node-upload";
import crypto from "crypto";

describe("data", () => {
  const data = new CodexData(
    process.env["CLIENT_URL"] || "http://localhost:8080"
  );
  const spData = new CodexData(
    process.env["SP_URL"] || "http://localhost:8081"
  );

  it("uploads a file a download it locally", async () => {
    const content = crypto.randomBytes(16).toString("hex");

    const strategy = new NodeUploadStategy(content);
    const res = data.upload(strategy);
    const cid = await res.result;
    assert.ok(cid.error == false);
    assert.ok(cid.data);

    const cids = await data.cids();
    assert.ok(cids.error == false);
    assert.ok(cids.data.content.find((c) => c.cid == cid.data));

    const localDownload = await data.localDownload(cid.data);
    assert.ok(localDownload.error == false);
    assert.strictEqual(await localDownload.data.text(), content);

    const manifest = await data.fetchManifest(cid.data);
    assert.ok(manifest.error == false);
    assert.strictEqual(manifest.data.cid, cid.data);

    const { blockSize, datasetSize, treeCid } = manifest.data.manifest;
    assert.ok(blockSize);
    assert.ok(datasetSize);
    assert.ok(treeCid);
  });

  it("saves the metadata uploads provided during the upload", async () => {
    const content = crypto.randomBytes(16).toString("hex");

    const strategy = new NodeUploadStategy(content, {
      filename: "hello.txt",
      mimetype: "text/plain",
    });
    const res = data.upload(strategy);
    const cid = await res.result;

    assert.ok(cid.error == false);
    assert.ok(cid.data);

    const manifest = await data.fetchManifest(cid.data);
    assert.ok(manifest.error == false);
    assert.strictEqual(manifest.data.cid, cid.data);

    const { filename, mimetype } = manifest.data.manifest;
    assert.strictEqual(filename, "hello.txt");
    assert.ok(mimetype, "text/plain");
  });

  it("fails when providing wrong metadata", async () => {
    const content = crypto.randomBytes(16).toString("hex");

    const strategy = new NodeUploadStategy(content, {
      filename: "hello.txt",
      mimetype: "plain/text",
    });
    const res = data.upload(strategy);
    const cid = await res.result;

    assert.ok(cid.error == true);
    assert.ok(
      cid.data.message.includes(" The MIME type 'plain/text' is not valid")
    );
    assert.equal(cid.data.code, 422);
  });

  it("delete a file a locally", async () => {
    const content = "b".repeat(131072);
    const strategy = new NodeUploadStategy(content);
    const res = data.upload(strategy);
    const cid = await res.result;
    assert.ok(cid.error == false);
    assert.ok(cid.data);

    let cids = await data.cids();
    assert.ok(cids.error == false);
    assert.ok(cids.data.content.find((c) => c.cid == cid.data));

    const del = await data.delete(cid.data);
    assert.ok(del.error == false);

    cids = await data.cids();
    assert.ok(cids.error == false);
    assert.notOk(cids.data.content.find((c) => c.cid == cid.data));
  });

  it("doesn't do anything when trying to delete a non existing cid", async () => {
    const content = crypto.randomBytes(16).toString("hex");
    const strategy = new NodeUploadStategy(content);
    const res = spData.upload(strategy);
    const cid = await res.result;
    assert.ok(cid.error == false);
    assert.ok(cid.data);

    const del = await data.delete(cid.data);
    assert.ok(del.error == false);
  });

  it("returns an error when providing an invalid cid", async () => {
    const del = await data.delete("hello");
    assert.ok(del.error);
    assert.ok(del.data.message.includes("Incorrect Cid"));
  });

  it("updates the space available when storing data", async () => {
    const content = crypto.randomBytes(16).toString("hex");

    let space = await data.space();
    assert.ok(space.error == false);
    assert.ok(space.data.quotaMaxBytes);

    const usedBytes = space.data.quotaUsedBytes;

    const strategy = new NodeUploadStategy(content);
    const res = data.upload(strategy);
    const cid = await res.result;
    assert.ok(cid.error == false);
    assert.ok(cid.data);

    space = await data.space();
    assert.ok(space.error == false);
    assert.ok(space.data.quotaMaxBytes);
    assert.ok(space.data.quotaUsedBytes > usedBytes);
  });

  it("stream downloads a file on the network", async () => {
    const content = crypto.randomBytes(16).toString("hex");

    const strategy = new NodeUploadStategy(content);
    const res = spData.upload(strategy);
    const cid = await res.result;
    assert.ok(cid.error == false);
    assert.ok(cid.data);

    const networkDownload = await data.networkDownloadStream(cid.data);
    assert.ok(networkDownload.error == false);
    assert.strictEqual(await networkDownload.data.text(), content);
  });

  it("downloads a file on the network", async () => {
    const content = crypto.randomBytes(16).toString("hex");

    const strategy = new NodeUploadStategy(content);
    const res = spData.upload(strategy);
    const cid = await res.result;
    assert.ok(cid.error == false);
    assert.ok(cid.data);

    const networkDownload = await data.networkDownload(cid.data);
    assert.ok(networkDownload.error == false);

    const cids = await data.cids();
    assert.ok(cids.error == false);
    assert.ok(cids.data.content.find((c) => c.cid == cid.data));
  });

  it("returns an error when trying to stream download a not existing file on the network", async () => {
    const cid = crypto.randomBytes(16).toString("hex");

    const networkDownload = await data.networkDownloadStream(cid);
    assert.ok(networkDownload.error);
    assert.strictEqual(networkDownload.data.message, "Incorrect Cid");
  });

  it("returns an error when trying to download a not existing file on the network", async () => {
    const cid = crypto.randomBytes(16).toString("hex");

    const networkDownload = await data.networkDownload(cid);
    assert.ok(networkDownload.error);
    assert.strictEqual(networkDownload.data.message, "Incorrect Cid");
  });

  it("returns an error when trying to download a not existing file locally", async () => {
    const cid = crypto.randomBytes(16).toString("hex");

    const networkDownload = await data.localDownload(cid);
    assert.ok(networkDownload.error);
    assert.strictEqual(networkDownload.data.message, "Incorrect Cid");
  });

  it("returns an error when trying to fetch a not existing manifest", async () => {
    const cid = crypto.randomBytes(16).toString("hex");

    const fetchManifest = await data.fetchManifest(cid);
    assert.ok(fetchManifest.error);
    assert.strictEqual(fetchManifest.data.message, "Incorrect Cid");
  });
});
