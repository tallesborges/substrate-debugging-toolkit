# AGENTS.md

Polkadot/Substrate extrinsics debugging toolkit.

**⚠️ ALWAYS UPDATE THIS FILE** when adding or modifying CLI commands or project structure.

## CLI Usage

- `bun cli.ts help` - Show help
- `bun cli.ts decode <extrinsic-hex> [--chain <name>] [--name <string>]` - Decode extrinsic
- `bun cli.ts build --address <hex> --call <hex> [--nonce <n>] [--tip <n>] [--era immortal|mortal]` - Build extrinsic
- `bun cli.ts compare <hex1> <hex2> [--name1 <s>] [--name2 <s>]` - Compare two extrinsics
- `bun cli.ts query-fees --address <hex> --call <hex> [--chain <name>]` - Query fees
- `bun cli.ts query-extrinsic-fees <extrinsic-hex> [--chain <name>]` - Query fees for existing extrinsic
- `bun cli.ts compact-scale --encode <n> | --decode <hex>` - Encode/decode SCALE compact
- `bun cli.ts get-storage <key> [block] [--chain <name>]` - Query storage
- `bun cli.ts get-block [--hash <hash>] [--chain <name>]` - Get block data
- `bun cli.ts list-pallets [--chain <name>]` - List pallets
- `bun cli.ts list-calls [--chain <name>] [--pallets <names>]` - List calls
- `bun cli.ts list-types [--chain <name>]` - List types
- `bun cli.ts describe-type <type-name> [--chain <name>]` - Show type structure
- `bun cli.ts list-constants [--chain <name>] [--pallet <name>]` - List constants
- `bun cli.ts describe-constant <pallet> <constant> [--chain <name>]` - Show constant info
- `bun cli.ts add-chain --name <name> --ws-url <url> [--display-name <name>] [--papi-key <key>] [--set-default]` - Add chain

## Setup

```bash
bun install
bunx papi add <chain> -n <name>
```

## Project Structure

```
cli.ts                      # CLI entry point
lib/extrinsic-utils.ts      # Decoder and builder
lib/extensions-parser.ts    # Dynamic extensions parser
extensions.json             # Chain-specific extensions config
chains.json                 # Chain RPC endpoints
commands/                   # CLI command implementations
```

## Adding a Chain

Edit `extensions.json` with your chain's signed extensions. See file header for format and field type documentation.

**Important:** Only include fields that actually encode bytes. Some signed extensions are "phantom" (type/verification only) and don't contribute to the encoded data. Check the actual runtime source to verify which fields encode.

Then run: `bun cli.ts add-chain --name <name> --ws-url <url>`

## Storage Keys

- **COLLECTIONS**: `0xfa7484c926e764ee2a64df96876c81459200647b8c99af7b8b52752114831bdb`
- **PENDING_COLLECTION_TRANSFERS**: `0xfa7484c926e764ee2a64df96876c8145ec71cb5fb8f048d4d001b5efa87fcf5b`
- **COLLECTION_ACCOUNTS**: `0xfa7484c926e764ee2a64df96876c814555aac77eef55f610e609e395282fe9a2`
- **TOKENS**: `0xfa7484c926e764ee2a64df96876c814599971b5749ac43e0235e41b0d3786918`
- **TOKEN_ACCOUNTS**: `0xfa7484c926e764ee2a64df96876c8145091ba7dd8dcd80d727d06b71fe08a103`
- **ATTRIBUTES**: `0xfa7484c926e764ee2a64df96876c8145761e97790c81676703ce25cc0ffeb377`
- **EVENTS**: `0x26aa394eea5630e07c48ae0c9558cef780d41e5e16056765bc8461851072c9d7`
- **SYSTEM_ACCOUNT**: `0x26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9`
- **TANKS**: `0xb8ed204d2f9b209f43a0487b80cceca11dff2785cc2c6efead5657dc32a2065e`
- **ACCOUNTS**: `0xb8ed204d2f9b209f43a0487b80cceca18ee7418a6531173d60d1f6a82d8f4d51`
- **LISTINGS**: `0xb8f32c9f36429933d924999a1b87423f202053cada0eb576e7ccf72ebc965b05`

## Code Style

- TypeScript: `strict: true`, ESNext target
- `noUncheckedIndexedAccess: true` (require undefined checks for array access)
- `allowImportingTsExtensions: true`
