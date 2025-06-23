# Flows Indexer — AGENTS.md

This file governs the behavior of AI coding agents working **inside the `/indexer` service** of the Flows monorepo. The indexer is a **Ponder-based blockchain indexer** that processes on-chain events and serves data via GraphQL API.

## 1. Repository map

| Path                | What lives here                             | Edit?             |
| ------------------- | ------------------------------------------- | ----------------- |
| `/src`              | Event handlers, API routes, utilities       | ✅                |
| `/src/tcr`          | TCR (Token Curated Registry) event handlers | ✅                |
| `/src/grants`       | Grant-related event handlers and logic      | ✅                |
| `/src/flows`        | Flow contract event handlers                | ✅                |
| `/src/dispute`      | Dispute mechanism handlers                  | ✅                |
| `/src/erc721`       | NFT-related event handlers                  | ✅                |
| `/src/api`          | Ponder API endpoints (GraphQL)              | ✅                |
| `/src/crons`        | Scheduled tasks (e.g., total-earned.ts)     | ✅                |
| `/src/queue`        | Queue system for async jobs                 | ✅                |
| `/src/kv`           | Key-value storage utilities                 | ✅                |
| `/abis.ts`          | Contract ABIs (340KB, auto-generated)       | ❌ generated      |
| `/addresses.ts`     | Contract addresses for networks             | ⚠️ review changes |
| `/ponder.config.ts` | Ponder configuration (contracts, chains)    | ⚠️ review changes |
| `/ponder.schema.ts` | Database schema for indexed data            | ⚠️ run codegen    |
| `/generated`        | Generated TypeScript types                  | 🚫 never touch    |
| `/.ponder`          | Ponder cache and internal files             | 🚫 never touch    |
| `/node_modules`     | Dependencies                                | 🚫 never touch    |

## 2. Coding conventions

### General Code Style

- Write concise, readable TypeScript code
- Use functional and declarative programming patterns; avoid classes
- Follow DRY (Don't Repeat Yourself) principle
- Implement early returns for better readability
- Use the "function" keyword for pure functions
- Type: `"module"` (ES modules)
- Target: Node.js 18+ (see `.nvmrc`)
- ESLint config: `"extends": "ponder"`

### Naming Conventions

- **Files & Directories**: Use lowercase with dashes (kebab-case)
  - Event handlers: `token-transfer.ts`, `flow-initialized.ts`
  - Utilities: `hash-utils.ts`, `validation-helpers.ts`
- **Functions & Variables**:
  - camelCase for functions and variables
  - Use descriptive names with auxiliary verbs for booleans: `isActive`, `hasVoted`, `isBlockRecent`
  - Event handler names should match contract events
- Favor named exports

### TypeScript Configuration

- Strict mode enabled (`"strict": true`)
- `noUncheckedIndexedAccess`: true for safer array/object access
- Module resolution: bundler
- Target: ES2022
- Use Ponder's generated types from schema
- Custom types exported in `types.ts` (Grant, Allocation, Dispute, etc.)

### Ponder-Specific Patterns

- Event handlers receive `event` and `context` parameters
- Use `context.db` for database operations (never direct queries)
- Use `context.client` for RPC calls
- Handle reorgs gracefully - all operations must be idempotent
- Import handlers using `ponder.on("Contract:Event", handler)` pattern
- Use `ponder:registry` for event registration
- Use `ponder:schema` for database types

### Database Operations

- Use Ponder's type-safe database methods
- Batch operations where possible
- Leverage lookup tables for efficient queries:
  - `tokenEmitterToErc20`
  - `arbitratorToGrantId`
  - `tcrToGrantId`
  - `flowContractAndRecipientIdToGrantId`
  - etc.
- Main tables: `grants`, `allocations`, `disputes`, `disputeVotes`, `tokenHolders`, `evidence`

### Performance Considerations

- Use `isBlockRecent()` utility to avoid redundant operations
- Minimize RPC calls - use indexed event data when possible
- Batch database operations using Ponder's bulk methods
- Keep event handlers lightweight
- Queue heavy operations (embeddings) for async processing

### Environment Variables

- `ALCHEMY_API_KEY`: Required for RPC endpoints
- Never commit `.env*.local` files
- RPC URLs constructed in `src/utils.ts`

### Error Handling

- Always handle potential null/undefined values
- Log errors with meaningful context
- Don't throw in event handlers - return early on errors
- Use try-catch for external calls (RPC, API)

## 3. Required commands

```bash
# Development (with hot reload)
pnpm dev

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Generate types from schema
pnpm codegen

# Production start
pnpm start
```

Agents **must** run lint and typecheck before pushing changes.

## 4. Pull-request checklist

1. All commands in section 3 pass locally
2. If `ponder.schema.ts` is modified, run `pnpm codegen` and commit generated types
3. If adding new contracts to `ponder.config.ts`, ensure proper startBlock is set
4. If modifying `addresses.ts`, verify addresses are lowercase
5. Test event handlers with real on-chain data locally
6. PR title follows Conventional Commits (`feat:`, `fix:`, `chore:`)
7. Include description of indexed events/contracts if adding new ones

## 5. Programmatic checks

- All modified files pass `pnpm lint` and `pnpm typecheck`
- If `ponder.schema.ts` changes, `pnpm codegen` must be run
- Event handlers must be idempotent (safe for reorgs)
- No direct database queries - use Ponder's context.db methods
- Verify new event handlers are registered in appropriate index files
- Ensure all addresses in code are lowercase
- Check that block numbers in `ponder.config.ts` are correct

## 6. Safety / limits

- **NEVER** commit `.env` files or expose RPC URLs
- **NEVER** commit API keys (ALCHEMY_API_KEY)
- Do **NOT** commit to `/generated`, `/.ponder`, or `/node_modules`
- No hardcoded private keys or sensitive data
- Event handlers must not make external HTTP calls (except via context.client)
- Be mindful of RPC rate limits - batch calls when possible
- Ask for review before:
  - Adding new chains or RPC providers
  - Modifying core configuration files
  - Changing deployment infrastructure
  - Adding new dependencies

## 7. Ponder Architecture Context

The indexer uses Ponder v0.11+ which provides:

- Automatic reorg handling
- GraphQL API generation at `/` and `/graphql`
- Type-safe database operations
- Multi-chain indexing (Base and Ethereum)

### Key Contracts Indexed

**Core Contracts:**

- **NounsFlow**: Main flow contract for grant distribution
- **FlowTCR**: Token Curated Registry for grant curation
- **CustomFlow**: Custom flow implementations (Grounds, Gnars)
- **Arbitrator**: Dispute resolution contracts
- **TokenEmitter**: Token distribution contracts
- **RewardPool**: Manager reward pools
- **SuperfluidPool**: Streaming payment pools

**ERC721 Contracts:**

- **NounsToken** (Ethereum mainnet)
- **VrbsToken**, **GnarsToken**, **GroundsToken** (Base)

**Supporting Contracts:**

- **TCRFactory**: Factory for creating new TCRs
- **ERC20VotesMintable**: Voting tokens
- **AllocationStrategies**: ERC721Votes, SingleAllocator

### Data Flow

1. **Event Processing**: Contract events → Event handlers → Database
2. **Queue System**: Heavy operations → Job queue → Async processing
3. **Embeddings**: Content → Embedding jobs → Vector storage
4. **API**: Database → GraphQL → Frontend

### Job Types (Queue System)

- `grant`: Grant embeddings
- `cast`: Farcaster cast embeddings
- `grant-application`: Application embeddings
- `flow`: Flow embeddings
- `dispute`: Dispute embeddings
- `draft-application`: Draft embeddings
- `builder-profile`: Builder profile embeddings

### Block Configuration

- Base chain blocks start from various points (see `blockStarts` in config)
- Mainnet Nouns starts from block 12985438
- TotalEarned cron runs every 6 hours

---

### Meta-instructions for downstream agents

1. This file overrides general rules from repo-root for the `/indexer` package
2. When modifying the schema, always regenerate types before committing
3. Follow Ponder best practices for event handler implementation
4. Maintain consistency with contract event names and handler names
5. Always lowercase Ethereum addresses when storing or comparing
6. Consider reorg safety in all database operations

Happy indexing 🚀
