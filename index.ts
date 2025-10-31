import { createClient } from "polkadot-api";
import { getWsProvider } from "@polkadot-api/ws-provider";
import { matrix } from "@polkadot-api/descriptors";
import { Binary } from "polkadot-api";

const EXTRINSICS = [
  {
    name: "EXTRINSIC 1",
    hex: "0x5102840090ea0c58aa1a2ed9db8bcb82f147f85dc0e1e56e7dd3ba87175df1577a4d636f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000019200400000a0000eca95101fd1e74920abb30c45b491949aff430c7c3a332e5c6ac8ec23f6bb54d13000064a7b3b6e00d",
  },
  {
    name: "EXTRINSIC 2",
    hex: "0x5102840090ea0c58aa1a2ed9db8bcb82f147f85dc0e1e56e7dd3ba87175df1577a4d636f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000019200400000a0000eca95101fd1e74920abb30c45b491949aff430c7c3a332e5c6ac8ec23f6bb54d13000064a7b3b6e00d",
  },
  {
    name: "EXTRINSIC 3",
    hex: "0x5102840090ea0c58aa1a2ed9db8bcb82f147f85dc0e1e56e7dd3ba87175df1577a4d636f010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010119200400000a0000eca95101fd1e74920abb30c45b491949aff430c7c3a332e5c6ac8ec23f6bb54d13000064a7b3b6e00d",
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

    const api = client.getTypedApi(matrix);

    for (const extrinsic of EXTRINSICS) {
      console.log(`\n${"=".repeat(80)}`);
      console.log(`${extrinsic.name}`);
      console.log(`${"=".repeat(80)}`);
      console.log("Extrinsic:", extrinsic.hex.slice(0, 50) + "...\n");

      const extrinsicBinary = Binary.fromHex(extrinsic.hex);
      const len = extrinsicBinary.asBytes().length;

      console.log(
        "=== METHOD 1: TransactionPaymentApi.query_info (runtime call) ===",
      );
      try {
        const paymentInfo1 = await api.apis.TransactionPaymentApi.query_info(
          extrinsicBinary,
          len,
        );
        console.log("✓ Success!");
        console.log(JSON.stringify(paymentInfo1, null, 2));
      } catch (error) {
        console.log("✗ Failed:");
        if (error instanceof Error) {
          console.log(error.message.split("\n")[0]);
        }
      }

      console.log(
        "\n=== METHOD 2: TransactionPaymentApi.query_fee_details (runtime call) ===",
      );
      try {
        const paymentInfo2 =
          await api.apis.TransactionPaymentApi.query_fee_details(
            extrinsicBinary,
            len,
          );
        console.log("✓ Success!");
        console.log(JSON.stringify(paymentInfo2, null, 2));
      } catch (error) {
        console.log("✗ Failed:");
        if (error instanceof Error) {
          console.log(error.message.split("\n")[0]);
        }
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
