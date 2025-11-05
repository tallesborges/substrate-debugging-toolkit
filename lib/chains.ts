import { matrix, matrixBlockchain } from "@polkadot-api/descriptors";

export const CHAINS = {
  canary: {
    name: "canary-matrixchain",
    url: "wss://archive.matrix.canary.enjin.io",
    descriptor: matrix,
  },
  enjin: {
    name: "enjin-matrixchain",
    url: "wss://archive.matrix.blockchain.enjin.io",
    descriptor: matrixBlockchain,
  },
} as const;

export type ChainKey = keyof typeof CHAINS;
