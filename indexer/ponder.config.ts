import { createConfig, factory } from "ponder"
import { getAbiItem } from "viem"
import {
  erc20VotesArbitratorImplAbi,
  erc20VotesMintableImplAbi,
  flowTcrImplAbi,
  nounsFlowImplAbi,
  superfluidPoolAbi,
  tcrFactoryImplAbi,
  gdav1Address,
  tokenEmitterImplAbi,
  customFlowImplAbi,
  nounsTokenAbi,
  cfav1Abi,
  cfav1Address,
  gdav1ImplAbi,
  cfav1ImplAbi,
} from "./abis"
import {
  base as baseContracts,
  mainnet as mainnetContracts,
  oldCustomFlowImpl,
  optimism as optimismContracts,
} from "./addresses"
import { getChainsAndRpcUrls, IndexerConfig, STREAMING_TOKENS } from "./src/utils"

const blockStarts = {
  base: {
    FLOWS: 21519031,
    GNARS: 11194740,
    GROUNDS: 12698633,
  },
  mainnet: {
    NOUNS_TOKEN: 12985438,
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
    TokenEmitter: {
      abi: tokenEmitterImplAbi,
      address: baseContracts.TokenEmitter,
      chain: "base",
      startBlock: blockStarts.base.FLOWS,
      // so we can pull erc20
      includeTransactionReceipts: true,
    },
    TokenEmitterChildren: {
      abi: tokenEmitterImplAbi,
      address: factory({
        address: baseContracts.TCRFactory,
        event: getAbiItem({
          abi: tcrFactoryImplAbi,
          name: "FlowTCRDeployed",
        }),
        parameter: "tokenEmitterProxy",
      }),
      chain: "base",
      includeTransactionReceipts: true,
      startBlock: blockStarts.base.FLOWS,
    },
    Erc20Token: {
      abi: erc20VotesMintableImplAbi,
      address: baseContracts.ERC20VotesMintable,
      chain: "base",
      startBlock: blockStarts.base.FLOWS,
    },
    Erc20TokenChildren: {
      abi: erc20VotesMintableImplAbi,
      address: factory({
        address: baseContracts.TCRFactory,
        event: getAbiItem({
          abi: tcrFactoryImplAbi,
          name: "FlowTCRDeployed",
        }),
        parameter: "erc20Proxy",
      }),
      chain: "base",
      startBlock: blockStarts.base.FLOWS,
    },
    SuperfluidPool: {
      abi: superfluidPoolAbi,
      chain: IndexerConfig.SuperfluidPool,
      filter: {
        event: "MemberUnitsUpdated",
        args: {
          token: STREAMING_TOKENS,
        },
      },
    },
    GdaV1: {
      abi: gdav1ImplAbi,
      chain: IndexerConfig.GdaV1,
      address: [gdav1Address[8453], gdav1Address[10]],
      filter: {
        event: "FlowDistributionUpdated",
        args: {
          // usdc on base
          token: STREAMING_TOKENS,
        },
      },
    },
    CfaV1: {
      abi: cfav1ImplAbi,
      chain: IndexerConfig.CfaV1,
      address: [cfav1Address[8453], cfav1Address[10]],
      filter: {
        event: "FlowUpdated",
        args: {
          token: STREAMING_TOKENS,
        },
      },
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
    ERC721TokenMainnet: {
      abi: nounsTokenAbi,
      chain: "ethereum",
      startBlock: blockStarts.mainnet.NOUNS_TOKEN,
      address: [mainnetContracts.NounsToken],
    },
    ERC721TokenBase: {
      abi: nounsTokenAbi,
      chain: "base",
      startBlock: Math.min(blockStarts.base.GNARS, blockStarts.base.GROUNDS),
      address: [baseContracts.VrbsToken, baseContracts.GroundsToken, baseContracts.GnarsToken],
    },
  },
  blocks: {
    TotalEarned: {
      chain: IndexerConfig.LatestBlockCron,
      interval: (6 * 60 * 60) / 0.25, // Every 6 hours (base block time is 250ms)
    },
    TokenPrices: {
      chain: IndexerConfig.LatestBlockCron,
      interval: (60 * 60) / 0.25, // Every hour (base block time is 250ms)
    },
  },
})
