import * as v from "valibot";
import { Api } from "../api/config";
import { CodexError, CodexValibotIssuesMap } from "../errors/errors";
import {
  Fetch,
  FetchAuthBuilder,
  type FetchAuth,
} from "../fetch-safe/fetch-safe";
import type { SafeValue } from "../values/values";
import {
  type CodexAvailabilityResponse,
  type CodexAvailability,
  type CodexSlot,
  type CodexSlotAgent,
  type CodexSlotResponse,
  type CodexSlotAgentResponse,
  type CodexAvailabilityWithoutTypes,
  type CodexAvailabilityCreateResponse,
  type CodexAvailabilityCreateBody,
  CodexAvailabilityPatchInput,
  type CodexReservationsResponse,
  type CodexPurchaseIdsResponse,
  type CodexPurchaseResponse,
  type CodexPurchase,
  type CodexStorageRequestCreateBody,
  type CodexReservation,
  type CodexPurchaseWithoutTypes,
  type CodexAvailabilityPatchBody,
} from "./types";
import {
  CodexCreateAvailabilityInput,
  CodexCreateStorageRequestInput,
} from "./types";

type CodexMarketplaceOptions = {
  auth?: FetchAuth;
};

export class CodexMarketplace {
  readonly url: string;
  readonly auth: FetchAuth = {};

  constructor(url: string, options?: CodexMarketplaceOptions) {
    this.url = url;

    if (options?.auth) {
      this.auth = options.auth;
    }
  }

  /**
   * Returns active slots
   */
  async activeSlots(): Promise<SafeValue<CodexSlot[]>> {
    const url = this.url + Api.config.prefix + "/sales/slots";

    return Fetch.safeJson<CodexSlotResponse[]>(url, {
      method: "GET",
      headers: FetchAuthBuilder.build(this.auth),
    });
  }

  /**
   * Returns active slot with id {slotId} for the host
   */
  async activeSlot(slotId: string): Promise<SafeValue<CodexSlotAgent>> {
    const url = this.url + Api.config.prefix + "/sales/slots/" + slotId;

    return Fetch.safeJson<CodexSlotAgentResponse>(url, {
      method: "GET",
      headers: FetchAuthBuilder.build(this.auth),
    });
  }

  private transformAvailability({
    freeSize,
    ...a
  }: CodexAvailabilityWithoutTypes) {
    const availability: CodexAvailability = {
      ...a,
      minPricePerBytePerSecond: BigInt(a.minPricePerBytePerSecond),
      totalCollateral: BigInt(a.totalCollateral),
      totalRemainingCollateral: BigInt(a.totalRemainingCollateral),
    };

    if (freeSize) {
      availability.freeSize = freeSize;
    }

    return availability;
  }

  /**
   * Returns storage that is for sale
   */
  async availabilities(): Promise<SafeValue<CodexAvailability[]>> {
    const url = this.url + Api.config.prefix + "/sales/availability";

    const res = await Fetch.safeJson<CodexAvailabilityResponse>(url, {
      method: "GET",
      headers: FetchAuthBuilder.build(this.auth),
    });

    if (res.error) {
      return res;
    }

    return {
      error: false,
      data: res.data.map(this.transformAvailability),
    };
  }

  /**
   * Offers storage for sale
   */
  async createAvailability(
    input: CodexCreateAvailabilityInput
  ): Promise<SafeValue<CodexAvailability>> {
    const result = v.safeParse(CodexCreateAvailabilityInput, input);

    if (!result.success) {
      return {
        error: true,
        data: new CodexError("Cannot validate the input", {
          errors: CodexValibotIssuesMap(result.issues),
        }),
      };
    }

    const url = this.url + Api.config.prefix + "/sales/availability";

    const body: CodexAvailabilityCreateBody = {
      totalSize: result.output.totalSize,
      duration: result.output.duration,
      minPricePerBytePerSecond:
        result.output.minPricePerBytePerSecond.toString(),
      totalCollateral: result.output.totalCollateral.toString(),
    };

    if (result.output.enabled) {
      body.enabled = result.output.enabled;
    }

    if (result.output.until) {
      body.until = result.output.until;
    }

    return Fetch.safeJson<CodexAvailabilityCreateResponse>(url, {
      method: "POST",
      headers: FetchAuthBuilder.build(this.auth),
      body: JSON.stringify(body),
    }).then((result) => {
      if (result.error) {
        return result;
      }

      return { error: false, data: this.transformAvailability(result.data) };
    });
  }

  /**
   * The new parameters will be only considered for new requests.
   * Existing Requests linked to this Availability will continue as is.
   */
  async updateAvailability(
    input: CodexAvailabilityPatchInput
  ): Promise<SafeValue<"">> {
    const result = v.safeParse(CodexAvailabilityPatchInput, input);

    if (!result.success) {
      return {
        error: true,
        data: new CodexError("Cannot validate the input", {
          errors: CodexValibotIssuesMap(result.issues),
        }),
      };
    }

    const url =
      this.url + Api.config.prefix + "/sales/availability/" + result.output.id;

    const { totalSize, duration, minPricePerBytePerSecond, totalCollateral } =
      result.output;
    let body: CodexAvailabilityPatchBody = {};

    if (totalSize) {
      body.totalSize = totalSize;
    }

    if (duration) {
      body.duration = duration;
    }

    if (minPricePerBytePerSecond) {
      body.minPricePerBytePerSecond = minPricePerBytePerSecond.toString();
    }

    if (totalCollateral) {
      body.totalCollateral = totalCollateral.toString();
    }

    if (result.output.enabled != undefined) {
      body.enabled = result.output.enabled;
    }

    if (result.output.until) {
      body.until = result.output.until;
    }

    const res = await Fetch.safe(url, {
      method: "PATCH",
      headers: FetchAuthBuilder.build(this.auth),
      body: JSON.stringify(body),
    });

    if (res.error) {
      return res;
    }

    return { error: false, data: "" };
  }

  /**
   * Return's list of Reservations for ongoing Storage Requests that the node hosts.
   */
  async reservations(
    availabilityId: string
  ): Promise<SafeValue<CodexReservation[]>> {
    const url =
      this.url +
      Api.config.prefix +
      `/sales/availability/${availabilityId}/reservations`;

    return Fetch.safeJson<CodexReservationsResponse>(url, {
      method: "GET",
      headers: FetchAuthBuilder.build(this.auth),
    });
  }

  /**
   * Returns list of purchase IDs
   */
  async purchaseIds(): Promise<SafeValue<CodexPurchaseIdsResponse>> {
    const url = this.url + Api.config.prefix + `/storage/purchases`;

    return Fetch.safeJson<CodexPurchaseIdsResponse>(url, {
      method: "GET",
      headers: FetchAuthBuilder.build(this.auth),
    });
  }

  private transformPurchase(p: CodexPurchaseWithoutTypes): CodexPurchase {
    const purchase: CodexPurchase = {
      requestId: p.requestId,
      state: p.state,
    };

    if (p.error) {
      purchase.error = p.error;
    }

    if (!p.request) {
      return purchase;
    }

    return {
      ...purchase,
      request: {
        ...p.request,
        ask: {
          ...p.request.ask,
          proofProbability: parseInt(p.request.ask.proofProbability, 10),
          pricePerBytePerSecond: parseInt(
            p.request.ask.pricePerBytePerSecond,
            10
          ),
        },
      },
    };
  }

  async purchases(): Promise<SafeValue<CodexPurchase[]>> {
    const res = await this.purchaseIds();

    if (res.error) {
      return res;
    }

    const promises = [];

    for (const id of res.data) {
      promises.push(this.purchaseDetail(id));
    }

    const purchases = await Promise.all(promises);

    return {
      error: false,
      data: purchases.map((p) =>
        p.error
          ? ({
              state: "errored",
              error: p.data.message,
              requestId: "",
            } satisfies CodexPurchase)
          : p.data
      ),
    };
  }

  /**
   * Returns purchase details
   */
  async purchaseDetail(purchaseId: string): Promise<SafeValue<CodexPurchase>> {
    const url =
      this.url + Api.config.prefix + `/storage/purchases/` + purchaseId;

    return Fetch.safeJson<CodexPurchaseResponse>(url, {
      headers: FetchAuthBuilder.build(this.auth),
      method: "GET",
    }).then((res) => {
      if (res.error) {
        return res;
      }

      return { error: false, data: this.transformPurchase(res.data) };
    });
  }

  /**
   * Creates a new request for storage.
   */
  async createStorageRequest(
    input: CodexCreateStorageRequestInput
  ): Promise<SafeValue<string>> {
    const result = v.safeParse(CodexCreateStorageRequestInput, input);

    if (!result.success) {
      return {
        error: true,
        data: new CodexError("Cannot validate the input", {
          errors: CodexValibotIssuesMap(result.issues),
        }),
      };
    }

    const {
      cid,
      duration,
      pricePerBytePerSecond,
      proofProbability,
      nodes,
      collateralPerByte,
      expiry,
      tolerance,
    } = result.output;
    const url = this.url + Api.config.prefix + "/storage/request/" + cid;

    return Fetch.safeText(url, {
      method: "POST",
      headers: FetchAuthBuilder.build(this.auth),
      body: JSON.stringify({
        duration,
        pricePerBytePerSecond: pricePerBytePerSecond.toString(),
        proofProbability: proofProbability.toString(),
        nodes,
        collateralPerByte: collateralPerByte.toString(),
        expiry,
        tolerance,
      } satisfies CodexStorageRequestCreateBody),
    });
  }
}
