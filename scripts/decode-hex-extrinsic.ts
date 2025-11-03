/**
 * Temp Decode Experiment
 *
 * Quick script to decode a user-provided extrinsic for debugging
 */

import { decodeExtrinsic } from "../lib/extrinsic-utils.ts";

const userExtrinsic =
  Bun.argv[2] ||
  "0x4d02840090ea0c58aa1a2ed9db8bcb82f147f85dc0e1e56e7dd3ba87175df1577a4d636f01010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010000040032094a2aec55ab948c3539fba1028bed12f95ad487278c2d2c914707e04c7c530ab71300007862a441a71000";

decodeExtrinsic(userExtrinsic, "USER'S BUILT EXTRINSIC");
