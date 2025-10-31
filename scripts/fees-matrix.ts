/**
 * Fees Matrix Runner
 * 
 * Purpose: Test multiple fee query methods across different Matrix chains
 * Chains: Canary Matrix, Matrix Blockchain
 * Methods: TransactionPaymentApi (state_call), payment_queryInfo, payment_queryFeeDetails
 * Output: Success/failure of each method for each extrinsic on each chain
 */

import { createClient } from "polkadot-api";
import { getWsProvider } from "@polkadot-api/ws-provider";
import { matrix, matrixBlockchain } from "@polkadot-api/descriptors";
import { Binary } from "polkadot-api";

const EXTRINSICS = [
  {
    name: "EXTRINSIC 1",
    hex: "0x5102840090ea0c58aa1a2ed9db8bcb82f147f85dc0e1e56e7dd3ba87175df1577a4d636f010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010119200400000a0000eca95101fd1e74920abb30c45b491949aff430c7c3a332e5c6ac8ec23f6bb54d13000064a7b3b6e00d",
  },
  {
    name: "EXTRINSIC 2",
    hex: "0x5102840090ea0c58aa1a2ed9db8bcb82f147f85dc0e1e56e7dd3ba87175df1577a4d636f0101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101f5000000000a0000eca95101fd1e74920abb30c45b491949aff430c7c3a332e5c6ac8ec23f6bb54d13000064a7b3b6e00d96000000",
  },
  {
    name: "EXTRINSIC 3 (exact copy of EXTRINSIC 2 to verify it works)",
    hex: "0x5102840090ea0c58aa1a2ed9db8bcb82f147f85dc0e1e56e7dd3ba87175df1577a4d636f0101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101f5000000000a0000eca95101fd1e74920abb30c45b491949aff430c7c3a332e5c6ac8ec23f6bb54d13000064a7b3b6e00d96000000",
  },
  {
    name: "EXTRINSIC 4",
    hex: "0x510284002a2e006163694cecf967886701735254e103fd9507bd030f695df7c863f58f75010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010100000000000a00006ac0f1f6310a97e93599796c71f4ed620cac5c2e4a124b2967e0c06a693b000313000064a7b3b6e00d",
  },
];

const CHAINS = [
  {
    name: "canary-matrixchain",
    url: "wss://rpc.matrix.canary.enjin.io",
  },
  {
    name: "matrix-blockchain",
    url: "wss://rpc.matrix.blockchain.enjin.io",
  },
];

async function runTestsForChain(chain: { name: string; url: string }) {
  console.log(`\n${"#".repeat(80)}`);
  console.log(`Testing chain: ${chain.name}`);
  console.log(`URL: ${chain.url}`);
  console.log(`${"#".repeat(80)}`);
  console.log(`Connecting to ${chain.url}...`);

  const provider = getWsProvider(chain.url);
  const client = createClient(provider);

  try {
    console.log("Connected! Attempting to query fee...\n");

    const descriptor =
      chain.name === "matrix-blockchain" ? matrixBlockchain : matrix;
    const api = client.getTypedApi(descriptor);

    for (const extrinsic of EXTRINSICS) {
      console.log(`\n${"=".repeat(80)}`);
      console.log(`${extrinsic.name}`);
      console.log(`${"=".repeat(80)}`);
      console.log("Extrinsic:", extrinsic.hex.slice(0, 50) + "...\n");

      const extrinsicBinary = Binary.fromHex(extrinsic.hex);
      const len = extrinsicBinary.asBytes().length;

      console.log(
        "=== METHOD 1: state_call TransactionPaymentApi_query_info (direct RPC) ===",
      );
      try {
        const result1 = await client._request("state_call", [
          "TransactionPaymentApi_query_info",
          extrinsic.hex,
        ]);
        console.log("✓ Success!");
        console.log(JSON.stringify(result1, null, 2));
      } catch (error: any) {
        console.log("✗ Failed:");
        console.log("Code:", error.code);
        console.log("Message:", error.message);
      }

      console.log(
        "\n=== METHOD 2: state_call TransactionPaymentApi_query_fee_details (direct RPC) ===",
      );
      try {
        const result2 = await client._request("state_call", [
          "TransactionPaymentApi_query_fee_details",
          extrinsic.hex,
        ]);
        console.log("✓ Success!");
        console.log(JSON.stringify(result2, null, 2));
      } catch (error: any) {
        console.log("✗ Failed:");
        console.log("Code:", error.code);
        console.log("Message:", error.message);
      }

      console.log(
        "\n=== METHOD 3: payment_queryInfo (legacy RPC via client._request) ===",
      );
      try {
        const jsonRpcCall = await client._request("payment_queryInfo", [
          extrinsic.hex,
        ]);
        console.log("✓ Success!");
        console.log(JSON.stringify(jsonRpcCall, null, 2));
      } catch (error: any) {
        console.log("✗ Failed:");
        console.log("Code:", error.code);
        console.log("Data:", error.data);
      }

      console.log(
        "\n=== METHOD 4: payment_queryFeeDetails (legacy RPC via client._request) ===",
      );
      try {
        const jsonRpcCall2 = await client._request("payment_queryFeeDetails", [
          extrinsic.hex,
        ]);
        console.log("✓ Success!");
        console.log(JSON.stringify(jsonRpcCall2, null, 2));
      } catch (error: any) {
        console.log("✗ Failed:");
        console.log("Code:", error.code);
        console.log("Data:", error.data);
      }
    }
  } catch (error) {
    console.error("\n✗ General error!");
    console.error("Error:", error);
  } finally {
    await client.destroy();
    console.log(`\nConnection closed for ${chain.name}.`);
  }
}

async function main() {
  for (const chain of CHAINS) {
    await runTestsForChain(chain);
  }
}

main().catch(console.error);
