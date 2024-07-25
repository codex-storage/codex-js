import { type InferIssue } from "valibot";

type ValidationError = {
  expected: string;
  received: string;
  message: string;
  path: string;
};

/**
 *  The CodexError which can be error object of 3 types:
 * `error`: Object containing the error message
 * `api`: Object containing the api error message and the status code
 * `validation`: Object containing the error message and a field `errors` of type ValidationError
 * containing the error message for each fields.
 */
export type CodexError =
  | {
      type: "error";
      message: string;
    }
  | {
      type: "api";
      message: string;
      status: number;
    }
  | {
      type: "validation";
      message: string;
      errors: ValidationError[];
    };

export const CodexValibotIssuesMap = (issues: InferIssue<any>[]) =>
  issues.map((i) => ({
    expected: i.expected,
    received: i.received,
    message: i.message,
    path: i.path.map((item: { key: string }) => item.key).join("."),
  }));
