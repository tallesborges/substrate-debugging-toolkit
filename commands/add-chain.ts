import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import type { ChainsConfig } from "../lib/chain-config.ts";

interface AddChainArgs {
  name: string;
  displayName?: string;
  wsUrl: string;
  papiKey?: string;
  setDefault?: boolean;
}

export async function commandAddChain(args: AddChainArgs) {
  const { name, displayName, wsUrl, papiKey, setDefault } = args;

  if (!name || !wsUrl) {
    console.error("❌ Error: --name and --ws-url are required");
    console.log(
      "\nUsage: bun cli.ts add-chain --name <name> --ws-url <url> [--display-name <name>] [--papi-key <key>] [--set-default]",
    );
    process.exit(1);
  }

  const finalPapiKey = papiKey || name;
  const finalDisplayName = displayName || name;

  console.log(`\n📦 Adding chain "${name}"...`);

  try {
    console.log("\n1️⃣ Adding chain to Polkadot API...");
    const papiCommand = `bunx papi add ${wsUrl} -n ${finalPapiKey}`;
    console.log(`   Running: ${papiCommand}`);
    execSync(papiCommand, { stdio: "inherit" });
    console.log("   ✓ Chain added to .papi/polkadot-api.json");

    console.log("\n2️⃣ Updating chains.json...");
    const configPath = join(process.cwd(), "chains.json");
    let config: ChainsConfig;

    try {
      const content = readFileSync(configPath, "utf-8");
      config = JSON.parse(content);
    } catch (error) {
      console.log("   chains.json not found, creating new one...");
      config = {
        chains: [],
        defaultChain: name,
      };
    }

    const existingChain = config.chains.find((c) => c.name === name);
    if (existingChain) {
      console.log(`   ⚠️  Chain "${name}" already exists, updating...`);
      existingChain.displayName = finalDisplayName;
      existingChain.wsUrl = wsUrl;
      existingChain.papiKey = finalPapiKey;
    } else {
      config.chains.push({
        name,
        displayName: finalDisplayName,
        wsUrl,
        papiKey: finalPapiKey,
      });
      console.log(`   ✓ Added "${name}" to chains.json`);
    }

    if (setDefault || config.chains.length === 1) {
      config.defaultChain = name;
      console.log(`   ✓ Set "${name}" as default chain`);
    }

    writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");

    console.log("\n✅ Chain successfully added!");
    console.log(`\n📋 Chain details:`);
    console.log(`   Name:         ${name}`);
    console.log(`   Display Name: ${finalDisplayName}`);
    console.log(`   WS URL:       ${wsUrl}`);
    console.log(`   PAPI Key:     ${finalPapiKey}`);
    console.log(
      `   Default:      ${config.defaultChain === name ? "Yes" : "No"}`,
    );
    console.log(`\n🚀 You can now use: --chain ${name}`);
  } catch (error: any) {
    console.error("\n❌ Failed to add chain:");
    console.error(error.message);
    process.exit(1);
  }
}
