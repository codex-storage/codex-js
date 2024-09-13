import * as v from "valibot";
import { Api } from "../api/config";
import { CodexValibotIssuesMap } from "../errors/errors";
import { Fetch } from "../fetch-safe/fetch-safe";
import type { SafeValue } from "../values/values";
import {
  type CodexAvailability,
  type CodexAvailabilityCreateResponse,
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

    return Fetch.safeJson<CodexAvailability[]>(url, {
      method: "GET",
    });
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
        data: {
          message: "Cannot validate the input",
          errors: CodexValibotIssuesMap(result.issues),
        },
      };
    }

    const url = this.url + Api.config.prefix + "/sales/availability";

    return Fetch.safeJson<CodexAvailabilityCreateResponse>(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(result.output),
    });
  }

  /**
   * The new parameters will be only considered for new requests.
   * Existing Requests linked to this Availability will continue as is.
   */
  async updateAvailability(
    input: CodexUpdateAvailabilityInput
  ): Promise<SafeValue<CodexAvailability>> {
    const result = v.safeParse(CodexUpdateAvailabilityInput, input);

    if (!result.success) {
      return {
        error: true,
        data: {
          message: "Cannot validate the input",
          errors: CodexValibotIssuesMap(result.issues),
        },
      };
    }

    const url =
      this.url + Api.config.prefix + "/sales/availability/" + result.output.id;

    return Fetch.safeJson<CodexAvailability>(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(result.output),
    });
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
        data: {
          message: "Cannot validate the input",
          errors: CodexValibotIssuesMap(result.issues),
        },
      };
    }

    const {
      cid,
      duration,
      reward,
      proofProbability,
      nodes,
      collateral,
      expiry,
      tolerance,
    } = result.output;
    const url = this.url + Api.config.prefix + "/storage/request/" + cid;

    const res = await Fetch.safe(url, {
      method: "POST",
      // headers: {
      //   "content-type": "application/json",
      // },
      body: JSON.stringify({
        duration: duration.toString(),
        reward: reward.toString(),
        proofProbability: proofProbability.toString(),
        nodes,
        collateral: collateral.toString(),
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
