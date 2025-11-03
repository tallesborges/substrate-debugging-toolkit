# Chain Configuration

The CLI supports multiple Polkadot/Substrate chains through a centralized configuration system.

## Supported Chains

| Key      | Name                  | RPC URL                                    |
|----------|----------------------|---------------------------------------------|
| `canary` | canary-matrixchain   | wss://rpc.matrix.canary.enjin.io           |
| `matrix` | matrix-blockchain    | wss://rpc.matrix.blockchain.enjin.io       |

## Usage

All commands that interact with chains support the `--chain` flag:

```bash
# Query fees on canary (default)
bun cli.ts query-fees --address 0x... --call 0x...

# Query fees on matrix
bun cli.ts query-fees --address 0x... --call 0x... --chain matrix
```

## Adding New Chains

To add a new chain, edit [cli.ts](file:///Users/tallesborges/Documents/projects/personal/polkadot-api-bun/cli.ts) and add an entry to the `CHAINS` constant:

```typescript
const CHAINS = {
  canary: {
    name: "canary-matrixchain",
    url: "wss://rpc.matrix.canary.enjin.io",
    descriptor: matrix,
  },
  matrix: {
    name: "matrix-blockchain",
    url: "wss://rpc.matrix.blockchain.enjin.io",
    descriptor: matrixBlockchain,
  },
  // Add your new chain here
  mynewchain: {
    name: "my-new-chain",
    url: "wss://rpc.mynewchain.io",
    descriptor: mynewchainDescriptor, // Import from @polkadot-api/descriptors
  },
} as const;
```

The chain descriptor must be generated using:

```bash
bunx papi add <chain-ws-url> -n <chain-name>
```

This will add the chain to `.papi/` and update the descriptors.
