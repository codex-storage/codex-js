import * as v from "valibot";
import { Api } from "../api/config";
import { CodexError, CodexValibotIssuesMap } from "../errors/errors";
import { Fetch } from "../fetch-safe/fetch-safe";
import type { SafeValue } from "../values/values";
import {
  type CodexAvailability,
  type CodexAvailabilityCreateResponse,
  type CodexAvailabilityDto,
  CodexCreateAvailabilityInput,
  CodexCreateStorageRequestInput,
  type CodexPurchase,
  type CodexReservation,
  type CodexSlot,
  type CodexStorageRequest,
  CodexUpdateAvailabilityInput,
} from "./types";

export class CodexMarketplace {
  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Returns active slots
   */
  async activeSlots(): Promise<SafeValue<CodexSlot[]>> {
    const url = this.url + Api.config.prefix + "/sales/slots";

    return Fetch.safeJson<CodexSlot[]>(url, {
      method: "GET",
    });
  }

  /**
   * Returns active slot with id {slotId} for the host
   */
  async activeSlot(slotId: string): Promise<SafeValue<CodexSlot>> {
    const url = this.url + Api.config.prefix + "/sales/slots/" + slotId;

    return Fetch.safeJson<CodexSlot>(url, {
      method: "GET",
    });
  }

  /**
   * Returns storage that is for sale
   */
  async availabilities(): Promise<SafeValue<CodexAvailability[]>> {
    const url = this.url + Api.config.prefix + "/sales/availability";

    const res = await Fetch.safeJson<CodexAvailabilityDto[]>(url, {
      method: "GET",
    });

    if (res.error) {
      return res;
    }

    return {
      error: false,
      data: res.data.map((a) => ({
        id: a.id,
        totalSize: parseInt(a.totalSize, 10),
        freeSize: parseInt(a.freeSize, 10),
        duration: parseInt(a.duration, 10),
        minPricePerBytePerSecond: parseInt(a.minPricePerBytePerSecond, 10),
        totalCollateral: parseInt(a.totalCollateral, 10),
        totalRemainingCollateral: parseInt(a.totalRemainingCollateral, 10),
      })),
    };
  }

  /**
   * Offers storage for sale
   */
  async createAvailability(
    input: CodexCreateAvailabilityInput
  ): Promise<SafeValue<CodexAvailabilityCreateResponse>> {
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

    const body = result.output;

    return Fetch.safeJson<CodexAvailabilityCreateResponse>(url, {
      method: "POST",
      body: JSON.stringify({
        totalSize: body.totalSize.toString(),
        duration: body.duration.toString(),
        minPricePerBytePerSecond: body.minPricePerBytePerSecond.toString(),
        totalCollateral: body.totalCollateral.toString(),
      }),
    });
  }

  /**
   * The new parameters will be only considered for new requests.
   * Existing Requests linked to this Availability will continue as is.
   */
  async updateAvailability(
    input: CodexUpdateAvailabilityInput
  ): Promise<SafeValue<"">> {
    const result = v.safeParse(CodexUpdateAvailabilityInput, input);

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

    const body = result.output;

    const res = await Fetch.safe(url, {
      method: "PATCH",
      body: JSON.stringify({
        totalSize: body.totalSize.toString(),
        duration: body.duration.toString(),
        minPricePerBytePerSecond: body.minPricePerBytePerSecond.toString(),
        totalCollateral: body.totalCollateral.toString(),
      }),
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

    return Fetch.safeJson<CodexReservation[]>(url, {
      method: "GET",
    });
  }

  /**
   * Returns list of purchase IDs
   */
  async purchaseIds(): Promise<SafeValue<string[]>> {
    const url = this.url + Api.config.prefix + `/storage/purchases`;

    return Fetch.safeJson<string[]>(url, {
      method: "GET",
    });
  }

  async purchases(): Promise<SafeValue<CodexPurchase[]>> {
    const url = this.url + Api.config.prefix + `/storage/purchases`;

    const res = await Fetch.safeJson<string[]>(url, {
      method: "GET",
    });

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
              state: "error",
              error: p.data.message,
              requestId: "",
              request: {} as CodexStorageRequest,
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

    return Fetch.safeJson<CodexPurchase>(url, {
      method: "GET",
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

    const res = await Fetch.safe(url, {
      method: "POST",
      body: JSON.stringify({
        duration: duration.toString(),
        pricePerBytePerSecond: pricePerBytePerSecond.toString(),
        proofProbability: proofProbability.toString(),
        nodes,
        collateralPerByte: collateralPerByte.toString(),
        expiry: expiry.toString(),
        tolerance,
      }),
    });

    if (res.error) {
      return res;
    }

    return { error: false, data: await res.data.text() };
  }
}
