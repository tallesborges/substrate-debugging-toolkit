/**
 * Query Fees Runner
 * 
 * Purpose: Build an extrinsic and query its fees using multiple methods
 * Chain: Canary Matrix (wss://rpc.matrix.canary.enjin.io)
 * Output: Fee information from TransactionPaymentApi and payment RPC methods
 */

import { createClient } from "polkadot-api";
import { getWsProvider } from "@polkadot-api/ws-provider";
import { buildExtrinsic, decodeExtrinsic } from "../lib/extrinsic-utils.ts";

const CALL_DATA =
  "0x0a00006ac0f1f6310a97e93599796c71f4ed620cac5c2e4a124b2967e0c06a693b000313000064a7b3b6e00d";
const SENDER_ADDRESS =
  "0x2a2e006163694cecf967886701735254e103fd9507bd030f695df7c863f58f75";

const extrinsic = buildExtrinsic({
  address: SENDER_ADDRESS,
  call: CALL_DATA,
  nonce: 0,
  tip: 0,
  era: "immortal",
});

console.log("Generated extrinsic:");
console.log(extrinsic);

console.log("\n");
decodeExtrinsic(extrinsic, "Generated Extrinsic Validation");

console.log("\nConnecting to Canary Matrix...");

const provider = getWsProvider("wss://rpc.matrix.canary.enjin.io");
const client = createClient(provider);

try {
  console.log("\n=== Attempting TransactionPaymentApi_query_info ===");
  try {
    const result1 = await client._request("state_call", [
      "TransactionPaymentApi_query_info",
      extrinsic,
    ]);
    console.log("✓ Success!");
    console.log(JSON.stringify(result1, null, 2));
  } catch (error: any) {
    console.log("✗ Failed:");
    console.log("Message:", error.message);
  }

  console.log("\n=== Attempting payment_queryInfo ===");
  try {
    const result2 = await client._request("payment_queryInfo", [extrinsic]);
    console.log("✓ Success!");
    console.log(JSON.stringify(result2, null, 2));
  } catch (error: any) {
    console.log("✗ Failed:");
    console.log("Message:", error.message);
  }

  console.log("\n=== Attempting payment_queryFeeDetails ===");
  try {
    const result3 = await client._request("payment_queryFeeDetails", [
      extrinsic,
    ]);
    console.log("✓ Success!");
    console.log(JSON.stringify(result3, null, 2));
  } catch (error: any) {
    console.log("✗ Failed:");
    console.log("Message:", error.message);
  }
} finally {
  await client.destroy();
}
