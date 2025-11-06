import * as descriptors from "@polkadot-api/descriptors";
import { getChain, getAllChains, type ChainConfig } from "./chain-config.ts";

export interface Chain {
  name: string;
  url: string;
  descriptor: any;
}

function buildChains(): Record<string, Chain> {
  const allChains = getAllChains();
  const chains: Record<string, Chain> = {};

  for (const chain of allChains) {
    const descriptor = (descriptors as any)[chain.papiKey];
    if (!descriptor) {
      console.warn(
        `Warning: No descriptor found for ${chain.papiKey}, skipping ${chain.name}`,
      );
      continue;
    }

    chains[chain.name] = {
      name: chain.displayName,
      url: chain.wsUrl,
      descriptor,
    };
  }

  return chains;
}

export const CHAINS = buildChains();

export type ChainKey = keyof typeof CHAINS;

export { getChain, getAllChains, type ChainConfig };
