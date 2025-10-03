import { createConfig, factory } from "ponder"
import { getAbiItem } from "viem"
import {
  erc20VotesArbitratorImplAbi,
  flowTcrImplAbi,
  nounsFlowImplAbi,
  superfluidPoolAbi,
  tcrFactoryImplAbi,
  gdav1Address,
  customFlowImplAbi,
  cfav1Abi,
  cfav1Address,
  gdav1Abi,
} from "./abis"
import {
  base as baseContracts,
  oldCustomFlowImpl,
  optimism as optimismContracts,
} from "./addresses"
import { getChainsAndRpcUrls, IndexerConfig } from "./src/utils"

const blockStarts = {
  base: {
    FLOWS: 21519031,
    GNARS: 11194740,
    GROUNDS: 12698633,
  },
}

export default createConfig({
  database: { kind: "postgres" },
  chains: getChainsAndRpcUrls(),
  contracts: {
    NounsFlow: {
      abi: nounsFlowImplAbi,
      address: baseContracts.NounsFlow,
      chain: "base",
      startBlock: blockStarts.base.FLOWS,
    },
    NounsFlowChildren: {
      abi: nounsFlowImplAbi,
      address: factory({
        address: baseContracts.NounsFlow,
        event: getAbiItem({
          abi: nounsFlowImplAbi,
          name: "FlowRecipientCreated", // only works because they were created via application first
        }),
        parameter: "recipient",
      }),
      chain: "base",
      startBlock: blockStarts.base.FLOWS,
    },
    FlowTcr: {
      abi: flowTcrImplAbi,
      address: baseContracts.FlowTCR,
      chain: "base",
      startBlock: blockStarts.base.FLOWS,
    },
    FlowTcrChildren: {
      abi: flowTcrImplAbi,
      address: factory({
        address: baseContracts.TCRFactory,
        event: getAbiItem({
          abi: tcrFactoryImplAbi,
          name: "FlowTCRDeployed",
        }),
        parameter: "flowTCRProxy",
      }),
      chain: "base",
      startBlock: blockStarts.base.FLOWS,
    },
    NounsFlowTcrFactory: {
      abi: tcrFactoryImplAbi,
      address: baseContracts.TCRFactory,
      chain: "base",
      startBlock: blockStarts.base.FLOWS,
    },
    Arbitrator: {
      abi: erc20VotesArbitratorImplAbi,
      address: baseContracts.ERC20VotesArbitrator,
      chain: "base",
      startBlock: blockStarts.base.FLOWS,
    },
    ArbitratorChildren: {
      abi: erc20VotesArbitratorImplAbi,
      address: factory({
        address: baseContracts.TCRFactory,
        event: getAbiItem({
          abi: tcrFactoryImplAbi,
          name: "FlowTCRDeployed",
        }),
        parameter: "arbitratorProxy",
      }),
      chain: "base",
      startBlock: blockStarts.base.FLOWS,
    },
    SuperfluidPool: {
      abi: superfluidPoolAbi,
      chain: IndexerConfig.SuperfluidPool,
    },
    GdaV1: {
      abi: gdav1Abi,
      chain: IndexerConfig.GdaV1,
      address: [gdav1Address[8453], gdav1Address[10]],
    },
    CfaV1: {
      abi: cfav1Abi,
      chain: IndexerConfig.CfaV1,
      address: [cfav1Address[8453], cfav1Address[10]],
    },
    CustomFlow: {
      abi: customFlowImplAbi,
      chain: IndexerConfig.CustomFlow,
      filter: {
        event: "FlowInitialized",
        args: {
          flowImpl: [
            baseContracts.CustomFlowImpl,
            optimismContracts.CustomFlowImpl,
            ...oldCustomFlowImpl,
          ],
        },
      },
    },
  },
  blocks: {
    TotalEarned: {
      chain: IndexerConfig.LatestBlockCron,
      interval: (6 * 60 * 60) / 0.25, // Every 6 hours (base block time is 250ms)
    },
    UnderlyingTokenPrices: {
      chain: IndexerConfig.LatestBlockCron,
      interval: (60 * 60) / 0.25, // Every hour (base block time is 250ms)
    },
    FundraisingTokenPrices: {
      chain: IndexerConfig.LatestBlockCron,
      interval: (60 * 60) / 0.25, // Every hour (base block time is 250ms)
    },
    FlowRateSetup: {
      chain: IndexerConfig.LatestBlockCron,
      interval: (24 * 60 * 60) / 0.25, // Every 24 hours
    },
  },
})
