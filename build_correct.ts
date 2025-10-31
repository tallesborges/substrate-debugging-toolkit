import { buildExtrinsic } from "./debug-extrinsics.ts";

const correctExtrinsic = buildExtrinsic({
  address: "0x2a2e006163694cecf967886701735254e103fd9507bd030f695df7c863f58f75", // from user's
  call: "282928",
  nonce: 0,
  tip: 0,
  era: "immortal",
});

console.log("Correct extrinsic for call 0x282928:");
console.log(correctExtrinsic);
