import type { components, paths } from "../openapi";
import * as v from "valibot";

export type CodexSlotResponse =
  paths["/sales/slots"]["get"]["responses"][200]["content"]["application/json"];

export type CodexSlot = CodexSlotResponse;

export type CodexSlotAgentResponse =
  paths["/sales/slots/{slotId}"]["get"]["responses"][200]["content"]["application/json"];

export type CodexSlotAgent = CodexSlotAgentResponse;

export type CodexAvailabilityResponse =
  paths["/sales/availability"]["get"]["responses"][200]["content"]["application/json"];

export type CodexAvailabilityWithoutTypes =
  components["schemas"]["SalesAvailabilityREAD"];

export type CodexAvailability = Omit<
  CodexAvailabilityWithoutTypes,
  | "freeSize"
  | "totalSize"
  | "minPricePerBytePerSecond"
  | "duration"
  | "totalCollateral"
  | "totalRemainingCollateral"
> & {
  freeSize?: number;
  totalSize: number;
  duration: number;
  minPricePerBytePerSecond: number;
  totalCollateral: number;
  totalRemainingCollateral: number;
};

export type CodexAvailabilityCreateResponse =
  paths["/sales/availability"]["post"]["responses"][201]["content"]["application/json"];

export type CodexAvailabilityCreateBody = Exclude<
  paths["/sales/availability"]["post"]["requestBody"],
  undefined
>["content"]["application/json"];

export const CodexCreateAvailabilityInput = v.strictObject({
  totalSize: v.pipe(v.number(), v.minValue(1)),
  duration: v.pipe(v.number(), v.minValue(1)),
  minPricePerBytePerSecond: v.pipe(v.number(), v.minValue(0)),
  totalCollateral: v.pipe(v.number(), v.minValue(0)),
  enabled: v.optional(v.boolean()),
  until: v.optional(v.pipe(v.number(), v.minValue(0))),
});

export type CodexAvailabilityPatchResponse =
  paths["/sales/availability/{id}"]["patch"]["responses"][204]["content"];

export type CodexAvailabilityPatchBody = Partial<
  Exclude<
    paths["/sales/availability"]["post"]["requestBody"],
    undefined
  >["content"]["application/json"]
>;

export type CodexCreateAvailabilityInput = v.InferOutput<
  typeof CodexCreateAvailabilityInput
>;

export const CodexAvailabilityPatchInput = v.strictObject({
  id: v.string(),
  totalSize: v.optional(v.pipe(v.number(), v.minValue(1))),
  duration: v.optional(v.pipe(v.number(), v.minValue(1))),
  minPricePerBytePerSecond: v.optional(v.pipe(v.number(), v.minValue(1))),
  totalCollateral: v.optional(v.pipe(v.number(), v.minValue(0))),
  enabled: v.optional(v.boolean()),
  until: v.optional(v.pipe(v.number(), v.minValue(0))),
});

export type CodexAvailabilityPatchInput = v.InferOutput<
  typeof CodexAvailabilityPatchInput
>;

export type CodexReservationsResponse =
  paths["/sales/availability/{id}/reservations"]["get"]["responses"][200]["content"]["application/json"];

export type CodexReservation = components["schemas"]["Reservation"];

export type CodexPurchaseIdsResponse =
  paths["/storage/purchases"]["get"]["responses"][200]["content"]["application/json"];

export type CodexPurchaseResponse =
  paths["/storage/purchases/{id}"]["get"]["responses"][200]["content"]["application/json"];

export type CodexStorageAsk = Omit<
  components["schemas"]["StorageAsk"],
  "slotSize" | "duration" | "proofProbability" | "pricePerBytePerSecond"
> & {
  slotSize: number;
  duration: number;
  proofProbability: number;
  pricePerBytePerSecond: number;
};

export type CodexPurchaseWithoutTypes = components["schemas"]["Purchase"];

export type CodexPurchase = Omit<
  components["schemas"]["Purchase"],
  "request"
> & {
  request?: Omit<components["schemas"]["StorageRequest"], "ask"> & {
    ask: CodexStorageAsk;
  };
};

export type CodexStorageRequestResponse =
  paths["/storage/request/{cid}"]["post"]["responses"][200]["content"]["text/plain"];

export type CodexStorageRequestCreateBody = Exclude<
  paths["/storage/request/{cid}"]["post"]["requestBody"],
  undefined
>["content"]["application/json"];

export const CodexCreateStorageRequestInput = v.strictObject({
  cid: v.string(),
  duration: v.pipe(v.number(), v.minValue(1)),
  pricePerBytePerSecond: v.pipe(v.number(), v.minValue(1)),
  proofProbability: v.pipe(v.number(), v.minValue(1)),
  nodes: v.optional(v.number(), 1),
  tolerance: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
  expiry: v.pipe(v.number(), v.minValue(1)),
  collateralPerByte: v.pipe(v.number(), v.minValue(1)),
});

export type CodexCreateStorageRequestInput = v.InferOutput<
  typeof CodexCreateStorageRequestInput
>;
