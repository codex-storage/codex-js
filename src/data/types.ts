import type { SafeValue } from "../values/values";

export type CodexManifest = {
  /**
   * "Root hash of the content"
   */
  // rootHash: string;

  /**
   * Length of original content in bytes
   */
  // originalBytes: number;

  /**
   * Total size of all blocks
   */
  datasetSize: number;

  /**
   *  "Size of blocks"
   */
  blockSize: number;

  /**
   * Indicates if content is protected by erasure-coding
   */
  protected: boolean;

  /**
   * Root of the merkle tree
   */
  treeCid: string;

  /**
   * Name of the name
   */
  filename: string | null;

  /**
   * Mimetype
   */
  mimetype: string | null;
};

export type CodexDataContent = {
  /**
   * Content Identifier as specified at https://github.com/multiformats/cid
   */
  cid: string;

  manifest: CodexManifest;
};

export type CodexDataResponse = { content: CodexDataContent[] };

export type CodexNodeSpace = {
  /**
   * Number of blocks stored by the node
   */
  totalBlocks: number;

  /**
   * Maximum storage space used by the node
   */
  quotaMaxBytes: number;

  /**
   * Amount of storage space currently in use
   */
  quotaUsedBytes: number;

  /**
   * Amount of storage space reserved
   */
  quotaReservedBytes: number;
};

export type UploadResponse = {
  result: Promise<SafeValue<string>>;
  abort: () => void;
};

export type NetworkDownloadResponse = { cid: string; manifest: CodexManifest };

export interface UploadStategy {
  download(url: string): Promise<SafeValue<string>>;
  abort(): void;
}
