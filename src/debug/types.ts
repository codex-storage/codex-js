import * as v from "valibot";

export const CodexLogLevel = v.picklist([
  "TRACE",
  "DEBUG",
  "INFO",
  "NOTICE",
  "WARN",
  "ERROR",
  "FATAL",
]);

export type CodexLogLevel = v.InferOutput<typeof CodexLogLevel>;

export type CodexDebugInfo = {
  /**
   * Peer Identity reference as specified at https://docs.libp2p.io/concepts/fundamentals/peers/
   */
  id: string;

  /**
   * Address of node as specified by the multi-address specification https://multiformats.io/multiaddr/
   */
  addrs: string[];

  /**
   * Path of the data repository where all nodes data are stored
   */
  repo: string;

  // Signed Peer Record (libp2p)
  spr: string;
};
