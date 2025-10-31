import { buildExtrinsic } from "./debug-extrinsics.ts";

const correctExtrinsic = buildExtrinsic({
  address: "0x2a2e006163694cecf967886701735254e103fd9507bd030f695df7c863f58f75",
  call: "0x0a00006ac0f1f6310a97e93599796c71f4ed620cac5c2e4a124b2967e0c06a693b000313000064a7b3b6e00d",
  nonce: 0,
  tip: 0,
  era: "immortal",
});

console.log("Correct extrinsic:");
console.log(correctExtrinsic);
