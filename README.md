# Codex SDK

The Codex SDK provides an API for interacting with the Codex decentralized storage network.

The SDK has a small bundle size and support tree shaking.

The SDK is currently under early development and the API can change at any time.

[![License: Apache](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Stability: experimental](https://img.shields.io/badge/stability-experimental-orange.svg)](#stability)
[![CI](https://github.com/codex-storage/codex-js/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/codex-storage/codex-js/actions/workflows/ci.yml?query=branch%3Amaster)

## Breaking changes

- Version 0.1.0 introduces [upload strategy](#upload) to support browser and Node JS.

## Types generation

The types are generated from the openapi.yaml using the commande:

```bash
npx openapi-typescript ./openapi.yaml -o src/openapi.ts  --default-non-nullable false
```

## How to use

### Sync api

The easiest way is to use the sync API, but you will not benefit from tree shaking.

```js
import { Codex } from "@codex-storage/sdk-js";
```

or

```js
const { Codex } = require("@codex-storage/sdk-js");
```

To create a Codex instance, provide the REST API url to interact with the Codex client:

```js
const codex = new Codex("http://localhost:8080");
```

Then you can access any module like this:

```js
const marketplace = codex.marketplace;
```

### Async api

```js
import { Codex } from "@codex-storage/sdk-js/async";
```

or

```js
const { Codex } = require("@codex-storage/sdk-js/async");
```

To create a Codex instance, provide the REST API url to interact with the Codex client:

```js
const codex = new Codex("http://localhost:8080");
```

To use a module, you need to use the await syntax. If the module is not loaded yet, it will be imported first and then cached in memory.

```js
const marketplace = await codex.marketplace();
```

### Authentication

You can use basic authentication when creating a new Codex object:

```js
const codex = new Codex("http://localhost:8080", {
  auth: {
    basic: "MY BASIC AUTH SECRET"
  }
});

You can obtain your secret using the `btoa` method in the browser or `Buffer.from(string).toString('base64')` in Node.js. The secret is stored in memory only.
```

### Error handling

The SDK provides a type called `SafeValue` for error handling instead of throwing errors. It is inspired by Go's "error as value" concept.
If the value represents an error, `error` is true and `data` will contain the error.
If the value is not an error, `error` is false and `data` will contain the requested data.

The [CodexError](./src/errors/errors.ts#L16) contains a message and 3 optionals properties:

- `code`: The (http) code error when it comes from a request
- `errors`: A {ValidationError} array when it comes from an object validation process
- `stack`: The error stack when the CodexError results from a error thrown

Example:

```js
const slots = marketplace.activeSlots();

if (slots.error) {
  // Do something to handle the error in slots.data
  return;
}

// Access the slots within slots.data.
```

### Compatibility

| SDK version | Codex version | Codex app |
| ----------- | ------------- | --------- |
| latest      | master        | latest    |
| 0.0.22      | Testnet 0.2.0 | 0.0.14    |
| 0.0.16      | Testnet 0.1.9 | 0.0.13    |

### Marketplace

The following API assume that you have already a marketplace module loaded, example:

```js
const codex = new Codex("http://localhost:8080");
// When using the async api
const marketplace = await codex.marketplace();

// When using the sync api
const marketplace = codex.marketplace;
```

#### activeSlots()

Returns active slots.

- returns Promise<[CodexSlot](./src/marketplace/types.ts#L7)[]>

Example:

```js
const slots = await marketplace.activeSlots();
```

#### activeSlot(slotId)

Returns active slot with id {slotId} for the host.

- slotId (string, required)
- returns Promise<[CodexSlotAgent](./src/marketplace/types.ts#L12)[]>

Example:

```js
const slotId = "AB9........";
const slot = await marketplace.activeSlot(slotId);
```

#### availabilities

Returns storage that is for sale.

- returns Promise<[CodexAvailability](./src/marketplace/types.ts#L20)>

Example:

```js
const availabilities = await marketplace.availabilities();
```

#### createAvailability

Offers storage for sale.

- input ([CodexCreateAvailabilityInput](./src/marketplace/types.ts#L45), required)
- returns Promise<[CodexAvailability](./src/marketplace/types.ts#L20)[]>

Example:

```js
const response = await marketplace.createAvailability({
  totalCollateral: 1,
  totalSize: 3000,
  minPricePerBytePerSecond: 100,
  duration: 100,
});
```

#### updateAvailability

Updates availability.

- input ([CodexAvailabilityPatchInput](./src/marketplace/types.ts#L66), required)
- returns Promise<"">

Example:

```js
const response = await marketplace.updateAvailability({
  id: "0x.....................",
  totalCollateral: 1,
  totalSize: 3000,
  minPricePerBytePerSecond: 100,
  duration: 100,
});
```

#### reservations

Return list of reservations for ongoing Storage Requests that the node hosts.

- availabilityId (string, required)
- returns Promise<[CodexReservation](./src/marketplace/types.ts#L83)[]>

Example:

```js
const reservations = await marketplace.reservations("Ox...");
```

#### createStorageRequest

Creates a new Request for storage

- input ([CodexCreateStorageRequestInput](./src/marketplace/types.ts#L120), required)
- returns Promise<string>

Example:

```js
const request = await marketplace.createStorageRequest({
  duration: 3000,
  pricePerBytePerSecond: 1,
  proofProbability: 1,
  nodes: 1,
  tolerance: 0,
  collateralPerByte: 100,
  expiry: 3000,
});
```

#### purchaseIds

Returns list of purchase IDs

- returns Promise<string[]>

Example:

```js
const ids = await marketplace.purchaseIds();
```

#### purchaseDetail

Returns purchase details

- purchaseId (string, required)
- returns Promise<[CodexPurchase](./src/marketplace/types.ts#L103)[]>

Example:

```js
const purchaseId = "Ox........";
const purchase = await marketplace.purchaseDetail(purchaseId);
```

### Data

The following API assume that you have already a data module loaded, example:

```js
const codex = new Codex("http://localhost:8080");
// When using the async api
const data = await codex.data();

// When using the sync api
const data = codex.data;
```

#### cids

Returns the manifest stored locally in node.

- returns Promise<[CodexDataItem](./src/data/types.ts#L8)[]>

Example:

```js
const cids = await data.cids();
```

#### space

Returns a summary of the storage space allocation of the node

- returns Promise<[CodexNodeSpace](./src/data/types.ts#L15)[]>

Example:

```js
const space = await data.space();
```

#### upload

Upload a file in a streaming manner

#### Browser

- stategy [BrowserUploadStategy](./src/data/browser-upload.ts#L5)
- returns [UploadResponse](./src/data/types.ts#L17)

Example:

```js
const file = new File(["foo"], "foo.txt", { type: "text/plain" });

const onProgress = (loaded, total) => {
  console.info("Loaded", loaded, "total", total);
};

const metadata = { filename: "foo.xt", mimetype: "text/plain" };

const stategy = new BrowserUploadStategy(file, onProgress, metadata);

const uploadResponse = data.upload(stategy);

const res = await uploadResponse.result;

if (res.error) {
  console.error(res.data);
  return;
}

console.info("CID is", res.data);
```

#### Node

- stategy [NodeUploadStategy](./src/data/node-upload.ts#L9)
- returns [UploadResponse](./src/data/types.ts#L17)

Example:

```js
const stategy = new NodeUploadStategy("Hello World !");
const uploadResponse = data.upload(stategy);

const res = await uploadResponse.result;

if (res.error) {
  console.error(res.data);
  return;
}

console.info("CID is", res.data);
```

#### manifest

Download only the dataset manifest from the network to the local node if it's not available locally.

- cid (string, required)
- returns [CodexManifest](./src/data/types.ts#L30)

Example:

```js
const cid = "QmYyQSo1c1Ym7orWxLYvCrM2EmxFTANf8wXmmE7DWjhx5N";
const manifest = await data.fetchManifest(cid);
```

#### networkDownloadStream

Download a file from the network in a streaming manner.
If the file is not available locally, it will be retrieved from other nodes in the network if able.

- cid (string, required)
- returns Response

Example:

```js
const cid = "QmYyQSo1c1Ym7orWxLYvCrM2EmxFTANf8wXmmE7DWjhx5N";
const result = await data.networkDownloadStream(cid);
```

#### localDownload

Download a file from the local node in a streaming manner.
If the file is not available locally, a 404 is returned.

- cid (string, required)
- returns Response

Example:

```js
const cid = "QmYyQSo1c1Ym7orWxLYvCrM2EmxFTANf8wXmmE7DWjhx5N";
const result = await data.localDownload(cid);
```

#### delete

Deletes either a single block or an entire dataset from the local node.
Does nothing if the dataset is not locally available.

- cid (string, required)
- returns ""

Example:

```js
const cid = "QmYyQSo1c1Ym7orWxLYvCrM2EmxFTANf8wXmmE7DWjhx5N";
const result = await data.delete(cid);
```

### Debug

The following API assume that you have already a node module loaded, example:

```js
const codex = new Codex("http://localhost:8080");
// When using the async api
const data = await codex.debug();

// When using the sync api
const data = codex.debug;
```

#### setLogLevel

Set log level at run time.

- level ([CodexLogLevel](./src/debug/types.ts#L7), required)
- returns Promise<"">

Example:

```js
await debug.setLogLevel("DEBUG");
```

#### info

Gets node information

- returns Promise<[CodexDebugInfo](./src/debug/types.ts#L23)>

Example:

```js
const info = await debug.info();
```

### Node

The following API assume that you have already a node module loaded, example:

```js
const codex = new Codex("http://localhost:8080");
// When using the async api
const node = await codex.node();

// When using the sync api
const node = codex.node;
```

#### spr

Get Node's SPR

- returns Promise<[CodexSpr](./src/node/types.ts#L11)>

Example:

```js
const spr = await node.spr();
```

By default, the response will be a json. You can use `text` option to get the string:

#### peeriD

Get Node's peer id

- returns Promise<[CodexPeerId](./src/node/types.ts#L25)>

Example:

```js
const peerId = await node.peerId();
```

By default, the response will be a json. You can use `text` option to get the string:

```js
const peerId = await node.peerId("text");
```

#### connect

Connect to a peer

- returns Promise<string>

Example:

```js
const peerId = "..."
const addrs = [...]
const spr = await node.connect(peerId, addrs);
```
