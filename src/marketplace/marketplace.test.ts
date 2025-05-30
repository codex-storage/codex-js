import { assert, describe, it } from "vitest";
import { CodexMarketplace } from "./marketplace";
import { CodexData } from "../data/data";
import { NodeUploadStategy } from "../data/node-upload";
import type {
  CodexAvailabilityPatchInput,
  CodexCreateAvailabilityInput,
  CodexCreateStorageRequestInput,
} from "./types";

describe("marketplace", async () => {
  describe("availability", async () => {
    const spMarketplace = new CodexMarketplace(
      process.env["SP_URL"] || "http://localhost:8081"
    );
    const totalSize = 1_000_000;
    const duration = 3000;
    const minPricePerBytePerSecond = 1000;
    const totalCollateral = 1_000_000_000;

    const body = {
      duration,
      totalCollateral,
      minPricePerBytePerSecond,
      totalSize,
    };

    const result = await spMarketplace.createAvailability(body);
    assert.ok(result.error == false);

    const availability = result.data;

    describe("create", async () => {
      it("verifies that the availability was created successfully", async () => {
        assert.ok(availability.id);
        assert.strictEqual(availability.duration, duration);
        assert.strictEqual(availability.freeSize, totalSize);
        assert.strictEqual(
          availability.minPricePerBytePerSecond,
          minPricePerBytePerSecond
        );
        assert.strictEqual(availability.totalCollateral, totalCollateral);
        assert.strictEqual(
          availability.totalRemainingCollateral,
          totalCollateral
        );
        assert.strictEqual(availability.totalSize, totalSize);
        assert.strictEqual(availability.until, 0);
        assert.ok(availability.enabled);
      });

      const errors: Partial<CodexCreateAvailabilityInput>[] = [
        { duration: 0 },
        { totalSize: 0 },
        { totalCollateral: -1 },
        { minPricePerBytePerSecond: -1 },
      ];

      for (const err of errors) {
        const field = Object.keys(err)[0] as keyof typeof err;
        assert.ok(field);

        it(`fails to create availability with wrong ${field}`, async () => {
          const response = await spMarketplace.createAvailability({
            ...body,
            [field]: err[field],
          });

          assert.ok(response.error);
          assert.ok(response.data.errors?.length);
          assert.equal(response.data.errors[0]?.path, field);
          assert.equal(
            response.data.errors[0]?.received,
            err[field]?.toString()
          );
          assert.ok(
            response.data.errors[0]?.message.startsWith("Invalid value:")
          );
        });
      }
    });

    describe("update", async () => {
      async function getUpdatedAvailability() {
        const availabilities = await spMarketplace.availabilities();
        assert.ok(availabilities.error == false);
        return availabilities.data.find((a) => a.id == availability.id);
      }

      const updates: Omit<CodexAvailabilityPatchInput, "id">[] = [
        { enabled: false },
        { duration: 3000 },
        { minPricePerBytePerSecond: 1 },
        { totalSize: 3000 },
        { totalCollateral: 3000 },
        { until: 5000 },
      ];

      for (const usecase of updates) {
        const field = Object.keys(usecase)[0] as keyof typeof usecase;
        assert.ok(field);

        it(`updates availability's ${field}`, async () => {
          const response = await spMarketplace.updateAvailability({
            id: availability.id,
            ...usecase,
          });
          assert.ok(response.error == false);

          const updated = await getUpdatedAvailability();
          assert.ok(updated?.[field] == usecase[field]);
        });
      }

      const errors: Omit<CodexAvailabilityPatchInput, "id">[] = [
        { duration: 0 },
        { totalSize: 0 },
        { totalCollateral: -1 },
        { minPricePerBytePerSecond: -1 },
        { until: -1 },
      ];

      for (const err of errors) {
        const field = Object.keys(err)[0] as keyof typeof err;
        assert.ok(field);

        it(`fails to update availability with wrong ${field}`, async () => {
          const response = await spMarketplace.updateAvailability({
            id: availability.id,
            ...err,
          });

          assert.ok(response.error);
          assert.ok(response.data.errors?.length);
          assert.equal(response.data.errors[0]?.path, field);
          assert.equal(
            response.data.errors[0]?.received,
            err[field]?.toString()
          );
          assert.ok(
            response.data.errors[0]?.message.startsWith("Invalid value:")
          );
        });
      }
    });
  });

  const data = new CodexData(
    process.env["CLIENT_URL"] || "http://localhost:8080"
  );
  const marketplace = new CodexMarketplace(
    process.env["CLIENT_URL"] || "http://localhost:8080"
  );

  async function uploadContent(sizeInBytes: number) {
    const content = "a".repeat(sizeInBytes);
    const strategy = new NodeUploadStategy(content);
    const res = data.upload(strategy);
    const cid = await res.result;
    assert.ok(cid.error == false);
    assert.ok(cid.data);
    return cid.data;
  }

  async function createStorageRequestBody(targetSizeInBytes = 131072) {
    return {
      cid: await uploadContent(targetSizeInBytes),
      duration: 1000,
      pricePerBytePerSecond: 1,
      proofProbability: 1,
      expiry: 900,
      collateralPerByte: 1,
      nodes: 3,
      tolerance: 1,
    };
  }

  describe("storage request", async () => {
    const body = await createStorageRequestBody();

    it("creates successfully", async () => {
      const request = await marketplace.createStorageRequest(body);
      assert.ok(request.error == false);
      assert.ok(request.data);
    });

    const errors: {
      request: Partial<CodexCreateStorageRequestInput>;
      message: string;
    }[] = [
      { request: { cid: "" }, message: "Incorrect Cid" },
      {
        request: { duration: 0 },
        message: "Cannot validate the input",
      },
      {
        request: { pricePerBytePerSecond: 0 },
        message: "Cannot validate the input",
      },
      {
        request: { proofProbability: 0 },
        message: "Cannot validate the input",
      },
      {
        request: { expiry: 0 },
        message: "Cannot validate the input",
      },
      {
        request: { collateralPerByte: 0 },
        message: "Cannot validate the input",
      },
      {
        request: { tolerance: 0 },
        message: "Cannot validate the input",
      },
      {
        request: { cid: await uploadContent(1) },
        message:
          "Dataset too small for erasure parameters, need at least 131072 bytes",
      },
      {
        request: { duration: 3000, expiry: 4000 },
        message:
          "Expiry must be greater than zero and less than the request's duration",
      },
      {
        request: { nodes: 2, tolerance: 1 },
        message:
          "Invalid parameters: parameters must satify `1 < (nodes - tolerance) ≥ tolerance`",
      },
    ];

    for (const err of errors) {
      it(`fails to create storage request with wrong ${JSON.stringify(err.request)}`, async () => {
        const request = await marketplace.createStorageRequest({
          ...body,
          ...err.request,
        });

        assert.ok(request.error);
        assert.ok(request.data.message.includes(err.message));

        if (request.data.errors?.length) {
          const keys = Object.keys(err.request);
          for (const e of request.data.errors) {
            assert.ok(e.path);
            assert.ok(keys.includes(e.path));
          }
        }
      });
    }
  });

  describe("purchases", async () => {
    const body = await createStorageRequestBody();

    const request = await marketplace.createStorageRequest(body);
    assert.ok(request.error == false);
    assert.ok(request.data);

    it("lists successfully", async () => {
      const ids = await marketplace.purchaseIds();

      assert.ok(ids.error == false);
      assert.ok(ids.data.length);
      assert.ok(ids.data[0]);

      const purchase = await marketplace.purchaseDetail(ids.data[0]);
      assert.ok(purchase.error == false);
      assert.ok(purchase.data.requestId);
      assert.ok(purchase.data.state);

      const purchases = await marketplace.purchases();
      assert.ok(purchases.error == false);
      assert.ok(purchases.data.length);
      assert.ok(purchases.data[0]?.requestId);
      assert.ok(purchases.data[0]?.state);
    });
  });
});
