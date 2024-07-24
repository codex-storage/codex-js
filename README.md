# Codex SDK 

The Codex SDK provides an API for interacting with the Codex decentralized storage network.

## Import 

```js
import { Codex } from "@codex/sdk-js";
```

or 

```js
const { Codex } = require("@codex/sdk-js");
```

## How to use 

To create a Codex instance, provide the REST API url to interact with the Codex client: 

```js
const codex = new Codex("http://localhost:3000")
```

### Error handling 

The SDK provides a type called `SafeValue` for error handling instead of throwing errors. It is inspired by Go's "error as value" concept.
If the value represents an error, `error` is true and `data` will contain the error.
If the value is not an error, `error` is false and `data` will contain the requested data.

The error type is a [CodexError](./src/errors/errors.ts#L15) which can be error object of 3 types: 

* `error`: Object containing the error message
* `api`: Object containing the api error message and the status code 
* `validation`: Object containing the error message and a field `errors` of type [ValidationError](./src/errors/errors.ts#L3) containing the error message for each fields.   

Example: 

```js
const slots = await codex.marketplace.activeSlots(); 

if (slots.error) {
    // Do something to handle the error in slots.data 
    return 
}

// Access the slots within slots.data.
```

### Marketplace 

#### activeSlots()

Returns active slots.

- returns Promise<[CodexSlot](./src/marketplace/types.ts#L86)[]>  

Example: 

```js
const slots = await codex.marketplace.activeSlots(); 
```

#### activeSlot(slotId)

Returns active slot with id {slotId} for the host.

- slotId (string, required)
- returns Promise<[CodexSlot](./src/marketplace/types.ts#L86)[]>

Example: 

```js
const slotId=  "AB9........"
const slot = await codex.marketplace.activeSlot(slotId); 
```


#### availabilities

Returns storage that is for sale.

- returns Promise<[CodexAvailability](./src/marketplace/types.ts#L100)>

Example: 

```js
const availabilities = await codex.marketplace.availabilities(); 
```

#### createAvailability

Offers storage for sale.

- input ([CodexCreateAvailabilityInput](./src/marketplace/types.ts#L133), required)
- returns Promise<[CodexAvailabilityCreateResponse](./src/marketplace/types.ts#L124)[]>  

Example: 

```js
const response = await codex.marketplace.createAvailability({
    maxCollateral: 1,
    totalSize: 3000,
    minPrice: 100,
    duration: 100,
}); 
```

#### reservations

Return list of reservations for ongoing Storage Requests that the node hosts.

- availabilityId (string, required)
- returns Promise<[CodexReservation](./src/marketplace/types.ts#L152)[]>

Example: 

```js
const reservations = await codex.marketplace.reservations("Ox..."); 
```


#### createStorageRequest

Creates a new Request for storage

- input ([CodexCreateStorageRequestInput](./src/marketplace/types.ts#L182), required)
- returns Promise<[CodexCreateStorageRequestResponse](./src/marketplace/types.ts#L195)[]>  

Example: 

```js
const request = await codex.marketplace.createStorageRequest({
    duration: 3000,
    reward: 100,
    proofProbability: 1,
    nodes: 1,
    tolerance: 0,
    collateral: 100,
    expiry: 3000
}); 
```


#### purchaseIds

Returns list of purchase IDs

- returns Promise<string[]>


Example: 

```js
const ids = await codex.marketplace.purchaseIds(); 
```

#### purchaseDetail

Returns list of purchase IDs

- purchaseId (string, required)
- returns Promise<[CodexPurchase](./src/marketplace/types.ts#L168)[]>

Example: 

```js
const purchaseId =  "Ox........"
const purchase = await codex.marketplace.purchaseDetail(purchaseId); 
```
