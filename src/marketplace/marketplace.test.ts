import { afterEach, assert, describe, it, vi } from "vitest";
import { Fetch } from "../fetch-safe/fetch-safe";
import { CodexMarketplace } from "./marketplace";
import {
  randomEthereumAddress,
  randomInt,
  randomString,
} from "../tests/tests.util";
import { CodexError } from "../errors/errors";

function createStorageRequest() {
  return {
    cid: randomString(64),
    duration: randomInt(1, 64000),
    reward: randomInt(1, 100),
    proofProbability: randomInt(1, 100),
    nodes: randomInt(1, 5),
    tolerance: randomInt(1, 100),
    expiry: randomInt(1, 100),
    collateral: randomInt(1, 100),
  };
}

function missingNumberValidationError(field: string) {
  return {
    error: true as any,
    data: new CodexError("Cannot validate the input", {
      errors: [
        {
          path: field,
          expected: "number",
          message: "Invalid type: Expected number but received undefined",
          received: "undefined",
        },
      ],
    }),
  };
}

function extraValidationError(field: string, value: unknown) {
  return {
    error: true as any,
    data: new CodexError("Cannot validate the input", {
      errors: [
        {
          path: field,
          expected: "never",
          message: `Invalid type: Expected never but received "${value}"`,
          received: `"${value}"`,
        },
      ],
    }),
  };
}

function missingStringValidationError(field: string) {
  return {
    error: true as any,
    data: new CodexError("Cannot validate the input", {
      errors: [
        {
          path: field,
          expected: "string",
          message: "Invalid type: Expected string but received undefined",
          received: "undefined",
        },
      ],
    }),
  };
}

function mistypeNumberValidationError(field: string, value: string) {
  return {
    error: true as any,
    data: new CodexError("Cannot validate the input", {
      errors: [
        {
          path: field,
          expected: "number",
          message: `Invalid type: Expected number but received "${value}"`,
          received: `"${value}"`,
        },
      ],
    }),
  };
}

function minNumberValidationError(field: string, min: number) {
  return {
    error: true as any,
    data: new CodexError("Cannot validate the input", {
      errors: [
        {
          path: field,
          expected: ">=" + min,
          message: "Invalid value: Expected >=1 but received 0",
          received: "0",
        },
      ],
    }),
  };
}

function createAvailability() {
  return {
    id: randomEthereumAddress(),
    totalSize: randomInt(0, 9).toString(),
    duration: randomInt(0, 9).toString(),
    minPrice: randomInt(0, 9).toString(),
    maxCollateral: randomInt(0, 9).toString(),
  };
}

describe("marketplace", () => {
  const marketplace = new CodexMarketplace("http://localhost:3000");

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns an error when trying to create an availability without total size", async () => {
    const response = await marketplace.createAvailability({
      duration: 3000,
      maxCollateral: 1,
      minPrice: 100,
    } as any);

    assert.deepStrictEqual(response, missingNumberValidationError("totalSize"));
  });

  it("returns an error when trying to create an availability with an invalid number valid", async () => {
    const response = await marketplace.createAvailability({
      duration: 3000,
      maxCollateral: 1,
      minPrice: 100,
      totalSize: "abc",
    } as any);

    assert.deepStrictEqual(
      response,
      mistypeNumberValidationError("totalSize", "abc")
    );
  });

  it("returns an error when trying to create an availability with zero total size", async () => {
    const response = await marketplace.createAvailability({
      duration: 3000,
      maxCollateral: 1,
      minPrice: 100,
      totalSize: 0,
    });

    assert.deepStrictEqual(response, minNumberValidationError("totalSize", 1));
  });

  it("returns an error when trying to create an availability without duration", async () => {
    const response = await marketplace.createAvailability({
      totalSize: 3000,
      maxCollateral: 1,
      minPrice: 100,
    } as any);

    assert.deepStrictEqual(response, missingNumberValidationError("duration"));
  });

  it("returns an error when trying to create an availability with zero duration", async () => {
    const response = await marketplace.createAvailability({
      duration: 0,
      maxCollateral: 1,
      minPrice: 100,
      totalSize: 3000,
    });

    assert.deepStrictEqual(response, minNumberValidationError("duration", 1));
  });

  it("returns an error when trying to create an availability without min price", async () => {
    const response = await marketplace.createAvailability({
      totalSize: 3000,
      maxCollateral: 1,
      duration: 100,
    } as any);

    assert.deepStrictEqual(response, missingNumberValidationError("minPrice"));
  });

  it("returns an error when trying to create an availability without max collateral", async () => {
    const response = await marketplace.createAvailability({
      totalSize: 3000,
      minPrice: 100,
      duration: 100,
    } as any);

    assert.deepStrictEqual(
      response,
      missingNumberValidationError("maxCollateral")
    );
  });

  it("returns an error when trying to create an availability with an extra field", async () => {
    const response = await marketplace.createAvailability({
      maxCollateral: 1,
      totalSize: 3000,
      minPrice: 100,
      duration: 100,
      hello: "world",
    } as any);

    assert.deepStrictEqual(response, extraValidationError("hello", "world"));
  });

  it("returns a response when the request succeed", async () => {
    const data = { ...createAvailability(), freeSize: "1000" };

    const spy = vi.spyOn(Fetch, "safeJson");
    spy.mockImplementationOnce(() => Promise.resolve({ error: false, data }));

    const response = await marketplace.createAvailability({
      maxCollateral: 1,
      totalSize: 3000,
      minPrice: 100,
      duration: 100,
    });

    assert.ok(!response.error);
    // @ts-ignore
    assert.deepEqual(response.data, data);
  });

  it("returns a response when the create availability succeed", async () => {
    const data = { ...createAvailability(), freeSize: "1000" };

    const spy = vi.spyOn(Fetch, "safeJson");
    spy.mockImplementationOnce(() => Promise.resolve({ error: false, data }));

    const response = await marketplace.createAvailability({
      maxCollateral: 1,
      totalSize: 3000,
      minPrice: 100,
      duration: 100,
    });

    assert.ok(!response.error);
    // @ts-ignore
    assert.deepEqual(response.data, data);
  });

  it("returns an error when trying to update an availability without id", async () => {
    const response = await marketplace.updateAvailability({
      maxCollateral: 1,
      totalSize: 3000,
      minPrice: 100,
      duration: 100,
    } as any);

    assert.deepStrictEqual(response, missingStringValidationError("id"));
  });

  it("returns an error when trying to update an availability with zero total size", async () => {
    const response = await marketplace.updateAvailability({
      id: randomString(64),
      totalSize: 0,
      minPrice: 100,
      duration: 100,
      maxCollateral: 100,
    });

    assert.deepStrictEqual(response, minNumberValidationError("totalSize", 1));
  });

  it("returns an error when trying to update an availability with zero duration", async () => {
    const response = await marketplace.updateAvailability({
      id: randomString(64),
      totalSize: 100,
      duration: 0,
      minPrice: 100,
      maxCollateral: 100,
    });

    assert.deepStrictEqual(response, minNumberValidationError("duration", 1));
  });

  it("returns a response when the update availability succeed", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
    } as any;
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const response = await marketplace.updateAvailability({
      id: randomString(64),
      totalSize: 3000,
      duration: 10,
      minPrice: 100,
      maxCollateral: 100,
    });

    assert.ok(!response.error);
  });

  it("returns an error when trying to create a storage request without cid", async () => {
    const { cid, ...rest } = createStorageRequest();

    const response = await marketplace.createStorageRequest(rest as any);

    assert.deepStrictEqual(response, missingStringValidationError("cid"));
  });

  it("returns an error when trying to create a storage request without duration", async () => {
    const { duration, ...rest } = createStorageRequest();

    const response = await marketplace.createStorageRequest(rest as any);

    assert.deepStrictEqual(response, missingNumberValidationError("duration"));
  });

  it("returns an error when trying to create a storage request with zero duration", async () => {
    const { duration, ...rest } = createStorageRequest();

    const response = await marketplace.createStorageRequest({
      ...rest,
      duration: 0,
    });

    assert.deepStrictEqual(response, minNumberValidationError("duration", 1));
  });

  it("returns an error when trying to create a storage request without reward", async () => {
    const { reward, ...rest } = createStorageRequest();

    const response = await marketplace.createStorageRequest(rest as any);

    assert.deepStrictEqual(response, missingNumberValidationError("reward"));
  });

  it("returns an error when trying to create a storage request without proof probability", async () => {
    const { proofProbability, ...rest } = createStorageRequest();

    const response = await marketplace.createStorageRequest(rest as any);

    assert.deepStrictEqual(
      response,
      missingNumberValidationError("proofProbability")
    );
  });

  it("returns an error when trying to create a storage request without expiry", async () => {
    const { expiry, ...rest } = createStorageRequest();

    const response = await marketplace.createStorageRequest(rest as any);

    assert.deepStrictEqual(response, missingNumberValidationError("expiry"));
  });

  it("returns an error when trying to create a storage request with zero expiry", async () => {
    const { expiry, ...rest } = createStorageRequest();

    const response = await marketplace.createStorageRequest({
      ...rest,
      expiry: 0,
    });

    assert.deepStrictEqual(response, minNumberValidationError("expiry", 1));
  });

  it("returns an error when trying to create a storage request without collateral", async () => {
    const { collateral, ...rest } = createStorageRequest();

    const response = await marketplace.createStorageRequest(rest as any);

    assert.deepStrictEqual(
      response,
      missingNumberValidationError("collateral")
    );
  });
});
