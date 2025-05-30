import { type FetchAuth } from "../fetch-safe/fetch-safe";
import { Throwable } from "../throwable/throwable";
import { CodexMarketplace } from "./marketplace";
import type {
  CodexAvailabilityPatchInput,
  CodexCreateAvailabilityInput,
  CodexCreateStorageRequestInput,
} from "./types";

type CodexMarketplaceThrowableOptions = {
  auth?: FetchAuth;
};

export class CodexMarketplaceThrowable {
  readonly marketplace: CodexMarketplace;

  constructor(url: string, options?: CodexMarketplaceThrowableOptions) {
    this.marketplace = new CodexMarketplace(url, options);
  }

  activeSlots = () => Throwable.from(this.marketplace.activeSlots());
  activeSlot = (slotId: string) =>
    Throwable.from(this.marketplace.activeSlot(slotId));
  availabilities = () => Throwable.from(this.marketplace.availabilities());
  createAvailability = (input: CodexCreateAvailabilityInput) =>
    Throwable.from(this.marketplace.createAvailability(input));
  updateAvailability = (input: CodexAvailabilityPatchInput) =>
    Throwable.from(this.marketplace.updateAvailability(input));
  reservations = (availabilityId: string) =>
    Throwable.from(this.marketplace.reservations(availabilityId));
  purchaseIds = () => Throwable.from(this.marketplace.purchaseIds());
  purchases = () => Throwable.from(this.marketplace.purchases());
  purchaseDetail = (purchaseId: string) =>
    Throwable.from(this.marketplace.purchaseDetail(purchaseId));
  createStorageRequest = (input: CodexCreateStorageRequestInput) =>
    Throwable.from(this.marketplace.createStorageRequest(input));
}
