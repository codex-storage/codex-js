import type { paths } from "../openapi";

export type CodexSprTextResponse =
  paths["/spr"]["get"]["responses"][200]["content"]["text/plain"];

export type CodexSprJsonResponse =
  paths["/spr"]["get"]["responses"][200]["content"]["application/json"];

export type CodexSprContentType = "json" | "text";

export type CodexSpr<T extends CodexSprContentType> = T extends "json"
  ? CodexSprJsonResponse
  : T extends "text"
    ? CodexSprTextResponse
    : never;

export type CodexPeerIdTextResponse =
  paths["/peerid"]["get"]["responses"][200]["content"]["text/plain"];

export type CodexPeerIdJsonResponse =
  paths["/peerid"]["get"]["responses"][200]["content"]["application/json"];

export type CodexPeerIdContentType = "json" | "text";

export type CodexPeerId<T extends CodexPeerIdContentType> = T extends "json"
  ? CodexPeerIdJsonResponse
  : T extends "text"
    ? CodexPeerIdTextResponse
    : never;
