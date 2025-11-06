import { readFileSync } from "fs";
import { join } from "path";

export interface ChainConfig {
  name: string;
  displayName: string;
  wsUrl: string;
  papiKey: string;
}

export interface ChainsConfig {
  chains: ChainConfig[];
  defaultChain: string;
}

let cachedConfig: ChainsConfig | null = null;

export function loadChainConfig(): ChainsConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const configPath = join(process.cwd(), "chains.json");
    const content = readFileSync(configPath, "utf-8");
    cachedConfig = JSON.parse(content);
    return cachedConfig!;
  } catch (error) {
    console.error("Error loading chains.json:", error);
    throw new Error(
      "Failed to load chains.json. Make sure the file exists in the project root.",
    );
  }
}

export function getChain(name?: string): ChainConfig {
  const config = loadChainConfig();
  const chainName = name || config.defaultChain;

  const chain = config.chains.find((c) => c.name === chainName);
  if (!chain) {
    const availableChains = config.chains.map((c) => c.name).join(", ");
    throw new Error(
      `Chain "${chainName}" not found. Available chains: ${availableChains}`,
    );
  }

  return chain;
}

export function getAllChains(): ChainConfig[] {
  const config = loadChainConfig();
  return config.chains;
}

export function getDefaultChain(): string {
  const config = loadChainConfig();
  return config.defaultChain;
}

export function getChainNames(): string[] {
  const config = loadChainConfig();
  return config.chains.map((c) => c.name);
}
