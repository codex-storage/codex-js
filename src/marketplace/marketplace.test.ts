import { faker } from "@faker-js/faker";
import assert from "assert";
import { describe, it } from "node:test";
import { Fetch } from "../fetch-safe/fetch-safe";
import { Marketplace } from "./marketplace";

// function createSlot() {
//  return {
//    "id": faker.string.alphanumeric(64),
//    "request": {

//      "id": faker.string.alphanumeric(64),
//      "client": faker.finance.ethereumAddress(),
//      "ask":
//      {
//        "slots": faker.number.int({ min: 0, max: 9 }),
//        "slotSize": faker.number.float({ max: 10000 }).toString(),
//        "duration": faker.number.int({ max: 300000 }).toString(),
//        "proofProbability": faker.number.int({ max: 9 }),
//        "reward": faker.number.float({ max: 1000 }).toString(),
//        "maxSlotLoss": faker.number.int({ max: 9 })
//      },
//      "content": {
//        "cid": faker.string.alphanumeric(64),
//        "por": {
//          "u": faker.string.alphanumeric(16),
//          "publicKey": faker.string.alphanumeric(64),
//          "name": faker.string.alphanumeric(16)
//        }
//      },
//      "expiry": faker.number.int({ min: 2, max: 59 }) + " minutes",
//      "nonce": faker.string.alphanumeric(64)
//    },
//    "slotIndex": faker.number.int({ min: 0, max: 9 })
//  }
// }

function createStorageRequest() {
  return {
    cid: faker.string.alphanumeric(64),
    duration: faker.number.int({ min: 1 }),
    reward: faker.number.int(),
    proofProbability: faker.number.int(),
    nodes: faker.number.int(),
    tolerance: faker.number.int(),
    expiry: faker.number.int({ min: 1 }),
    collateral: faker.number.int(),
  };
}

function missingNumberValidationError(field: string) {
  return {
    error: true,
    data: {
      message: "Cannot validate the input",
      errors: [
        {
          path: field,
          expected: "number",
          message: "Invalid type: Expected number but received undefined",
          received: "undefined",
        },
      ],
    },
  };
}

function extraValidationError(field: string, value: unknown) {
  return {
    error: true,
    data: {
      message: "Cannot validate the input",
      errors: [
        {
          path: field,
          expected: "never",
          message: `Invalid type: Expected never but received "${value}"`,
          received: `"${value}"`,
        },
      ],
    },
  };
}

function missingStringValidationError(field: string) {
  return {
    error: true,
    data: {
      message: "Cannot validate the input",
      errors: [
        {
          path: field,
          expected: "string",
          message: "Invalid type: Expected string but received undefined",
          received: "undefined",
        },
      ],
    },
  };
}

function mistypeNumberValidationError(field: string, value: string) {
  return {
    error: true,
    data: {
      message: "Cannot validate the input",
      errors: [
        {
          path: field,
          expected: "number",
          message: `Invalid type: Expected number but received "${value}"`,
          received: `"${value}"`,
        },
      ],
    },
  };
}

function minNumberValidationError(field: string, min: number) {
  return {
    error: true,
    data: {
      message: "Cannot validate the input",
      errors: [
        {
          path: field,
          expected: ">=" + min,
          message: "Invalid value: Expected >=1 but received 0",
          received: "0",
        },
      ],
    },
  };
}

function createAvailability() {
  return {
    id: faker.finance.ethereumAddress(),
    availabilityId: faker.finance.ethereumAddress(),
    size: faker.number.int({ min: 3000, max: 300000 }),
    requestId: faker.finance.ethereumAddress(),
    slotIndex: faker.number.int({ min: 0, max: 9 }),
  };
}

describe("marketplace", () => {
  const marketplace = new Marketplace("http://localhost:3000");

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

  it("returns a response when the request succeed", async (t) => {
    const data = { ...createAvailability(), freeSize: 1000 };

    t.mock.method(Fetch, "safeJson", () =>
      Promise.resolve({ error: false, data })
    );

    const response = await marketplace.createAvailability({
      maxCollateral: 1,
      totalSize: 3000,
      minPrice: 100,
      duration: 100,
    });

    assert.deepStrictEqual(response, { error: false, data });
  });

  it("returns a response when the create availability succeed", async (t) => {
    const data = { ...createAvailability(), freeSize: 1000 };

    t.mock.method(Fetch, "safeJson", () =>
      Promise.resolve({ error: false, data })
    );

    const response = await marketplace.createAvailability({
      maxCollateral: 1,
      totalSize: 3000,
      minPrice: 100,
      duration: 100,
    });

    assert.deepStrictEqual(response, { error: false, data });
  });

  it("returns an error when trying to update an availability without id", async () => {
    const response = await marketplace.updateAvailability({} as any);

    assert.deepStrictEqual(response, missingStringValidationError("id"));
  });

  it("returns an error when trying to update an availability with zero total size", async () => {
    const response = await marketplace.updateAvailability({
      id: faker.string.alphanumeric(64),
      totalSize: 0,
    });

    assert.deepStrictEqual(response, minNumberValidationError("totalSize", 1));
  });

  it("returns an error when trying to update an availability with zero duration", async () => {
    const response = await marketplace.updateAvailability({
      id: faker.string.alphanumeric(64),
      duration: 0,
    });

    assert.deepStrictEqual(response, minNumberValidationError("duration", 1));
  });

  it("returns a response when the update availability succeed", async (t) => {
    const data = createAvailability();

    t.mock.method(Fetch, "safeJson", () =>
      Promise.resolve({ error: false, data })
    );

    const response = await marketplace.updateAvailability({
      id: faker.string.alphanumeric(64),
      totalSize: 3000,
    });

    assert.deepStrictEqual(response, { error: false, data });
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
