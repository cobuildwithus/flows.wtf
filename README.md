# Nouns Flows

## Project Structure

- **contracts**: Contract addresses definition & ABIs generator
- **indexer**: Ponder-based indexer for chain data
- **web**: Frontend - Next.js application

## Getting Started

Navigate to the `contracts/` folder and run the following command to generate the ABIs for the contracts defined in the `addresses.ts` file:

```sh
pnpm generate
```

This step ensures that the required contract addresses and ABIs are generated and accessible for both the `indexer` and the `web` application.
