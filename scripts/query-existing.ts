/**
 * Test Existing Experiment
 * 
 * Tests a specific existing extrinsic (EXTRINSIC 4) from the fee matrix tests
 */

import { createClient } from "polkadot-api";
import { getWsProvider } from "@polkadot-api/ws-provider";
import { Binary } from "polkadot-api";
import { decodeExtrinsic } from "../lib/extrinsic-utils.ts";

// This is EXTRINSIC 4 from index.ts which has the same call
const EXTRINSIC_4 = "0x510284002a2e006163694cecf967886701735254e103fd9507bd030f695df7c863f58f75010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010100000000000a00006ac0f1f6310a97e93599796c71f4ed620cac5c2e4a124b2967e0c06a693b000313000064a7b3b6e00d";

console.log("Testing EXTRINSIC 4 which contains the same call data:");
decodeExtrinsic(EXTRINSIC_4, "EXTRINSIC 4");

const provider = getWsProvider("wss://rpc.matrix.blockchain.enjin.io");
const client = createClient(provider);

try {
  console.log("\n=== Testing with payment_queryInfo ===");
  const result = await client._request("payment_queryInfo", [EXTRINSIC_4]);
  console.log("✓ Success!");
  console.log(JSON.stringify(result, null, 2));
} catch (error: any) {
  console.log("✗ Failed:");
  console.log("Message:", error.message);
} finally {
  await client.destroy();
}
