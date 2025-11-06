# Polkadot/Substrate Extrinsics Debugging Toolkit

A comprehensive CLI tool for building, decoding, and analyzing Polkadot/Substrate extrinsics.

## Quick Start

```bash
# Install dependencies
bun install

# Show available commands
bun cli.ts help

# Add a new chain
bunx papi add <chain> -n <name>
```

## Key Features

- **Build & decode** extrinsics
- **Compare** two extrinsics side-by-side
- **Query fees** for calls and extrinsics
- **Inspect** blocks, storage, pallets, and types
- **SCALE encoding** utilities

## Common Commands

```bash
# Decode an extrinsic
bun cli.ts decode <extrinsic-hex>

# Compare two extrinsics
bun cli.ts compare <hex1> <hex2>

# Query call fees
bun cli.ts query-fees --address <address> --call <call-hex>

# Get block info
bun cli.ts get-block --hash <block-hash>

# List available pallets
bun cli.ts list-pallets
```

## Chain Configuration

### Adding a New Chain

Use the `add-chain` command:

```bash
bun cli.ts add-chain \
  --name polkadot \
  --ws-url wss://rpc.polkadot.io \
  --display-name "Polkadot Mainnet" \
  --set-default
```

This automatically:
- Adds the chain to `.papi/polkadot-api.json`
- Updates `chains.json` with the chain configuration
- Optionally sets it as the default chain

**Options:**
- `--name`: Chain identifier used in commands (required)
- `--ws-url`: WebSocket RPC endpoint (required)
- `--display-name`: Human-readable name (optional, defaults to name)
- `--papi-key`: PAPI descriptor key (optional, defaults to name)
- `--set-default`: Make this the default chain (optional)



## Documentation

See [AGENTS.md](AGENTS.md) for complete CLI reference.
