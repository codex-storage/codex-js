import { type InferIssue } from "valibot";

type ValidationError = {
  expected: string;
  received: string;
  message: string;
  path: string | undefined;
};

/**
 *  The CodexError contains a message and 3 optionals properties:
 * `code`: The (http) code error when it comes from a request
 * `errors`: A {ValidationError} array when it comes from an object validation process
 * `stack`: The error stack when the CodexError results from a error thrown
 */
export type CodexError = {
  message: string;
  code?: number;
  errors?: ValidationError[];
  stack?: string;
};

export const CodexValibotIssuesMap = (issues: InferIssue<any>[]) =>
  issues.map((i) => ({
    expected: i.expected,
    received: i.received,
    message: i.message,
    path: i.path?.map((item: { key: string }) => item.key).join("."),
  }));
