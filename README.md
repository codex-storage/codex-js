# Codex SDK

The Codex SDK provides an API for interacting with the Codex decentralized storage network.

The SDK has a small bundle size and support tree shaking.

The SDK is currently under early development and the API can change at any time.

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
const codex = new Codex("http://localhost:3000");
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
const codex = new Codex("http://localhost:3000");
```

To use a module, you need to use the await syntax. If the module is not loaded yet, it will be imported first and then cached in memory.

```js
const marketplace = await codex.marketplace;
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

### Marketplace

The following API assume that you have already a marketplace module loaded, example:

```js
const codex = new Codex("http://localhost:3000");
const marketplace = await codex.marketplace();
```

#### activeSlots()

Returns active slots.

- returns Promise<[CodexSlot](./src/marketplace/types.ts#L86)[]>

Example:

```js
const slots = await marketplace.activeSlots();
```

#### activeSlot(slotId)

Returns active slot with id {slotId} for the host.

- slotId (string, required)
- returns Promise<[CodexSlot](./src/marketplace/types.ts#L86)[]>

Example:

```js
const slotId = "AB9........";
const slot = await marketplace.activeSlot(slotId);
```

#### availabilities

Returns storage that is for sale.

- returns Promise<[CodexAvailability](./src/marketplace/types.ts#L100)>

Example:

```js
const availabilities = await marketplace.availabilities();
```

#### createAvailability

Offers storage for sale.

- input ([CodexCreateAvailabilityInput](./src/marketplace/types.ts#L160), required)
- returns Promise<[CodexAvailabilityCreateResponse](./src/marketplace/types.ts#L151)[]>

Example:

```js
const response = await marketplace.createAvailability({
  maxCollateral: 1,
  totalSize: 3000,
  minPrice: 100,
  duration: 100,
});
```

#### updateAvailability

Updates availability.

- input ([CodexUpdateAvailabilityInput](./src/marketplace/types.ts#L171), required)
- returns Promise<"">

Example:

```js
const response = await marketplace.updateAvailability({
  id: "0x.....................",
  maxCollateral: 1,
  totalSize: 3000,
  minPrice: 100,
  duration: 100,
});
```

#### reservations

Return list of reservations for ongoing Storage Requests that the node hosts.

- availabilityId (string, required)
- returns Promise<[CodexReservation](./src/marketplace/types.ts#L183)[]>

Example:

```js
const reservations = await marketplace.reservations("Ox...");
```

#### createStorageRequest

Creates a new Request for storage

- input ([CodexCreateStorageRequestInput](./src/marketplace/types.ts#L215), required)
- returns Promise<string>

Example:

```js
const request = await marketplace.createStorageRequest({
  duration: 3000,
  pricePerBytePerSecond: 1,
  proofProbability: 1,
  nodes: 1,
  tolerance: 0,
  collateral: 100,
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
- returns Promise<[CodexPurchase](./src/marketplace/types.ts#L199)[]>

Example:

```js
const purchaseId = "Ox........";
const purchase = await marketplace.purchaseDetail(purchaseId);
```

### Data

The following API assume that you have already a data module loaded, example:

```js
const codex = new Codex("http://localhost:3000");
const data = await codex.data;
```

#### cids

Returns the manifest stored locally in node.

- returns Promise<[CodexDataResponse](./src/data/types.ts#L59)[]>

Example:

```js
const cids = await data.cids();
```

#### space

Returns a summary of the storage space allocation of the node

- returns Promise<[CodexNodeSpace](./src/data/types.ts#L63)[]>

Example:

```js
const space = await data.space();
```

#### upload

Upload a file in a streaming manner

- file (File, required)
- onProgress (onProgress: (loaded: number, total: number) => void, optional)
- metadata ({ filename?: string, mimetype?: string }, optional)
- returns [UploadResponse](./src/data/types.ts#L85)

Example:

```js
// Get file from previous event
const [file] = e.target.files
const metadata = {
  filename: file.name,
  mimetype: file.type,
}
const upload = data.upload(file, (loaded: number, total: number) => {
  // Use loaded and total so update a progress bar for example
}, metadata);
await upload.result();
```

#### manifest

Download only the dataset manifest from the network to the local node if it's not available locally.

- cid (string, required)
- returns [CodexManifest](./src/data/types.ts#L3)

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

### Debug

The following API assume that you have already a node module loaded, example:

```js
const codex = new Codex("http://localhost:3000");
const data = await codex.debug;
```

#### setLogLevel

Set log level at run time.

- level ([CodexLogLevel](./src/debug/types.ts#L3), required)
- returns Promise<"">

Example:

```js
await debug.setLogLevel("DEBUG");
```

#### info

Gets node information

- returns Promise<[CodexDebugInfo](./src/debug/types.ts#L15)>

Example:

```js
const info = await debug.info();
```

### Node

The following API assume that you have already a node module loaded, example:

```js
const codex = new Codex("http://localhost:3000");
const node = await codex.node;
```

#### spr

Get Node's SPR

- returns Promise<[CodexSpr](./src/node/types.ts#L1)>

Example:

```js
const spr = await node.spr();
```
