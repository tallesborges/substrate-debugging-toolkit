/**
 * Temp Decode Experiment
 * 
 * Quick script to decode a user-provided extrinsic for debugging
 */

import { decodeExtrinsic } from "../lib/extrinsic-utils.ts";

const userExtrinsic =
  "0xad0184002a2e006163694cecf967886701735254e103fd9507bd030f695df7c863f58f7501010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010000000000282928";

decodeExtrinsic(userExtrinsic, "USER'S BUILT EXTRINSIC");
