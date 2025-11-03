import { matrix, matrixBlockchain } from "@polkadot-api/descriptors";

export const CHAINS = {
  canary: {
    name: "canary-matrixchain",
    url: "wss://rpc.matrix.canary.enjin.io",
    descriptor: matrix,
  },
  matrix: {
    name: "matrix-blockchain",
    url: "wss://rpc.matrix.blockchain.enjin.io",
    descriptor: matrixBlockchain,
  },
} as const;

export type ChainKey = keyof typeof CHAINS;
