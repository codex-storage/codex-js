import { type CodexError } from "../errors/errors";

/**
 * SafeValue is a type used for error handling instead of throwing errors.
 * It is inspired by Go's "error as value" concept.
 * If the value represents an error, `error` is true and `data` will contain the error.
 * If the value is not an error, `error` is false and `data` will contain the requested data.
 */
export type SafeValue<T> =
  | { error: false; data: T }
  | { error: true; data: CodexError };
