/**
 * Build Extrinsic Example
 *
 * Purpose: Demonstrate how to build a properly formatted extrinsic
 * Shows: Using buildExtrinsic utility with immortal era
 */

import { buildExtrinsic } from "../lib/extrinsic-utils.ts";

const correctExtrinsic = buildExtrinsic({
  address: "0x2a2e006163694cecf967886701735254e103fd9507bd030f695df7c863f58f75",
  call: "0x2829451f",
  nonce: 0,
  tip: 0,
  era: "immortal",
});

console.log("Correct extrinsic:");
console.log(correctExtrinsic);
