import { createConfig, factory, rateLimit } from "ponder"
import { getAbiItem, http } from "viem"
import { base, mainnet } from "viem/chains"
import {
  erc20VotesArbitratorImplAbi,
  erc20VotesMintableImplAbi,
  flowTcrImplAbi,
  nounsFlowImplAbi,
  superfluidPoolAbi,
  tcrFactoryImplAbi,
  gdav1Address,
  gdav1ImplAbi,
  tokenEmitterImplAbi,
  selfManagedFlowImplAbi,
  nounsTokenAbi,
  revolutionFlowImplAbi,
} from "./abis"
import { base as baseContracts, mainnet as mainnetContracts } from "./addresses"

const isDev = process.env.NODE_ENV === "development"

const blockStarts = {
  base: {
    FLOWS: 21519031,
    VRBS_FLOWS: 30152014,
    GNARS: 11194740,
  },
  mainnet: {
    NOUNS_TOKEN: 12985438,
  },
}

export default createConfig({
  database: { kind: "postgres" },
  networks: {
    base: {
      chainId: base.id,
      transport: rateLimit(http(process.env.PONDER_RPC_URL_8453), {
        requestsPerSecond: isDev ? 40 : 25,
      }),
    },
    mainnet: {
      chainId: mainnet.id,
      transport: rateLimit(http(process.env.PONDER_RPC_URL_1), {
        requestsPerSecond: isDev ? 40 : 25,
      }),
    },
  },
  contracts: {
    NounsFlow: {
      abi: nounsFlowImplAbi,
      address: baseContracts.NounsFlow,
      network: "base",
      startBlock: blockStarts.base.FLOWS,
    },
    NounsFlowChildren: {
      abi: nounsFlowImplAbi,
      address: factory({
        address: baseContracts.NounsFlow,
        event: getAbiItem({
          abi: nounsFlowImplAbi,
          name: "FlowRecipientCreated",
        }),
        parameter: "recipient",
      }),
      network: "base",
      startBlock: blockStarts.base.FLOWS,
    },
    FlowTcr: {
      abi: flowTcrImplAbi,
      address: baseContracts.FlowTCR,
      network: "base",
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
      network: "base",
      startBlock: blockStarts.base.FLOWS,
    },
    NounsFlowTcrFactory: {
      abi: tcrFactoryImplAbi,
      address: baseContracts.TCRFactory,
      network: "base",
      startBlock: blockStarts.base.FLOWS,
    },
    Arbitrator: {
      abi: erc20VotesArbitratorImplAbi,
      address: baseContracts.ERC20VotesArbitrator,
      network: "base",
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
      network: "base",
      startBlock: blockStarts.base.FLOWS,
    },
    TokenEmitter: {
      abi: tokenEmitterImplAbi,
      address: baseContracts.TokenEmitter,
      network: "base",
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
      network: "base",
      includeTransactionReceipts: true,
      startBlock: blockStarts.base.FLOWS,
    },
    Erc20Token: {
      abi: erc20VotesMintableImplAbi,
      address: baseContracts.ERC20VotesMintable,
      network: "base",
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
      network: "base",
      startBlock: blockStarts.base.FLOWS,
    },
    SuperfluidPool: {
      abi: superfluidPoolAbi,
      filter: {
        event: "MemberUnitsUpdated",
        args: {
          token: "0xd04383398dd2426297da660f9cca3d439af9ce1b",
        },
      },
      network: "base",
      startBlock: blockStarts.base.FLOWS,
    },
    GdaV1: {
      abi: gdav1ImplAbi,
      address: gdav1Address[8453],
      network: "base",
      startBlock: blockStarts.base.FLOWS,
      filter: {
        event: "FlowDistributionUpdated",
        args: {
          // usdc on base
          token: "0xd04383398dd2426297da660f9cca3d439af9ce1b",
        },
      },
    },
    RevolutionFlow: {
      abi: revolutionFlowImplAbi,
      address: baseContracts.VrbsFlow,
      network: "base",
      startBlock: blockStarts.base.VRBS_FLOWS,
    },
    RevolutionFlowChildren: {
      abi: revolutionFlowImplAbi,
      address: factory({
        address: baseContracts.VrbsFlow,
        event: getAbiItem({
          abi: revolutionFlowImplAbi,
          name: "FlowRecipientCreated",
        }),
        parameter: "recipient",
      }),
      network: "base",
      startBlock: blockStarts.base.VRBS_FLOWS,
    },
    SelfManagedFlow: {
      abi: selfManagedFlowImplAbi,
      filter: {
        event: "AllocatorChanged",
        args: {},
      },
      network: "base",
      startBlock: blockStarts.base.VRBS_FLOWS,
    },
    ERC721TokenMainnet: {
      abi: nounsTokenAbi,
      network: "mainnet",
      startBlock: blockStarts.mainnet.NOUNS_TOKEN,
      address: [mainnetContracts.NounsToken],
    },
    ERC721TokenBase: {
      abi: nounsTokenAbi,
      network: "base",
      startBlock: blockStarts.base.GNARS,
      address: [baseContracts.VrbsToken, baseContracts.GroundsToken],
    },
  },
  blocks: {
    TotalEarned: {
      network: "base",
      startBlock: "latest",
      interval: (6 * 60 * 60) / 2, // Every 6 hours (base block time is 2s)
    },
  },
})
