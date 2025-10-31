/**
 * Decode Call Example
 * 
 * Purpose: Demonstrate how to decode call data and analyze its structure
 * Shows: Breaking down pallet index, call index, and arguments
 */

import { createClient } from "polkadot-api";
import { getWsProvider } from "@polkadot-api/ws-provider";
import { matrixBlockchain } from "@polkadot-api/descriptors";
import { Binary } from "polkadot-api";

const CALL_DATA = "0x0a00006ac0f1f6310a97e93599796c71f4ed620cac5c2e4a124b2967e0c06a693b000313000064a7b3b6e00d";

console.log("Call data:", CALL_DATA);
console.log("Call bytes:", Binary.fromHex(CALL_DATA).asBytes());
console.log("\nBreaking down the call:");
console.log("Pallet index:", "0x0a", "(pallet 10)");
console.log("Call index:", "0x00", "(call 0)");
console.log("Arguments:", CALL_DATA.slice(6));

const provider = getWsProvider("wss://rpc.matrix.blockchain.enjin.io");
const client = createClient(provider);

try {
  const metadata = await client._request("state_getMetadata", []);
  console.log("\nMetadata fetched, analyzing...");
  
  // Try with a working extrinsic from the index.ts to see if the issue is the call or the extrinsic format
  const workingCall = "0x13000064a7b3b6e00d";
  console.log("\nLet's try building an extrinsic with a simpler working call:", workingCall);
  
} catch (error) {
  console.error("Error:", error);
} finally {
  await client.destroy();
}
