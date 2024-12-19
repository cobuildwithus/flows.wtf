import { createConfig, factory, rateLimit } from "ponder"
import { getAbiItem, http } from "viem"
import { base } from "viem/chains"
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
} from "./abis"
import { base as baseContracts } from "./addresses"

const isDev = process.env.NODE_ENV === "development"

const START_BLOCK = 21519031

export default createConfig({
  database: { kind: "postgres" },
  networks: {
    base: {
      chainId: base.id,
      transport: rateLimit(http(process.env.PONDER_RPC_URL_8453), {
        requestsPerSecond: isDev ? 40 : 25,
      }),
    },
  },
  contracts: {
    NounsFlow: {
      abi: nounsFlowImplAbi,
      address: baseContracts.NounsFlow,
      network: "base",
      startBlock: START_BLOCK,
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
      startBlock: START_BLOCK,
    },
    FlowTcr: {
      abi: flowTcrImplAbi,
      address: baseContracts.FlowTCR,
      network: "base",
      startBlock: START_BLOCK,
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
      startBlock: START_BLOCK,
    },
    NounsFlowTcrFactory: {
      abi: tcrFactoryImplAbi,
      address: baseContracts.TCRFactory,
      network: "base",
      startBlock: START_BLOCK,
    },
    Arbitrator: {
      abi: erc20VotesArbitratorImplAbi,
      address: baseContracts.ERC20VotesArbitrator,
      network: "base",
      startBlock: START_BLOCK,
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
      startBlock: START_BLOCK,
    },
    TokenEmitter: {
      abi: tokenEmitterImplAbi,
      address: baseContracts.TokenEmitter,
      network: "base",
      startBlock: START_BLOCK,
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
      startBlock: START_BLOCK,
    },
    Erc20Token: {
      abi: erc20VotesMintableImplAbi,
      address: baseContracts.ERC20VotesMintable,
      network: "base",
      startBlock: START_BLOCK,
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
      startBlock: START_BLOCK,
    },
    BaselinePool: {
      abi: superfluidPoolAbi,
      address: baseContracts.BaselinePool,
      network: "base",
      startBlock: START_BLOCK,
    },
    BonusPool: {
      abi: superfluidPoolAbi,
      address: baseContracts.BonusPool,
      network: "base",
      startBlock: START_BLOCK,
    },
    BaselinePoolChildren: {
      abi: superfluidPoolAbi,
      address: factory({
        address: baseContracts.TCRFactory,
        event: getAbiItem({
          abi: tcrFactoryImplAbi,
          name: "FlowTCRDeployed",
        }),
        parameter: "flowBaselinePool",
      }),
      network: "base",
      startBlock: START_BLOCK,
    },
    BonusPoolChildren: {
      abi: superfluidPoolAbi,
      address: factory({
        address: baseContracts.TCRFactory,
        event: getAbiItem({
          abi: tcrFactoryImplAbi,
          name: "FlowTCRDeployed",
        }),
        parameter: "flowBonusPool",
      }),
      network: "base",
      startBlock: START_BLOCK,
    },
    GdaV1: {
      abi: gdav1ImplAbi,
      address: gdav1Address[8453],
      network: "base",
      startBlock: START_BLOCK,
      filter: {
        event: "FlowDistributionUpdated",
        args: {
          // usdc on base
          token: "0xd04383398dd2426297da660f9cca3d439af9ce1b",
        },
      },
    },
  },
})
