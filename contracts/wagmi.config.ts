import { defineConfig, loadEnv } from "@wagmi/cli"
import { etherscan } from "@wagmi/cli/plugins"
import { base, mainnet } from "./addresses"

const baseContracts = [
  { name: "nounsFlowImpl", address: base.NounsFlowImpl },

  { name: "flowTcrImpl", address: base.FlowTCRImpl },

  { name: "erc20VotesArbitratorImpl", address: base.ERC20VotesArbitratorImpl },

  { name: "erc20VotesMintableImpl", address: base.ERC20VotesMintableImpl },

  { name: "tcrFactoryImpl", address: base.TCRFactoryImpl },

  { name: "tokenEmitterImpl", address: base.TokenEmitterImpl },

  { name: "rewardPoolImpl", address: base.RewardPoolImpl },

  { name: "tokenVerifier", address: base.TokenVerifier },

  { name: "customFlowImpl", address: base.CustomFlowImpl },

  { name: "erc721VotesStrategyImpl", address: base.ERC721VotesStrategyImpl },

  { name: "singleAllocatorStrategyImpl", address: base.SingleAllocatorStrategyImpl },

  { name: "jbMultiTerminal", address: base.JBMultiTerminal },

  { name: "superToken", address: "0xeb796bdb90ffa0f28255275e16936d25d3418603" as `0x${string}` },

  { name: "multicall3", address: "0xcA11bde05977b3631167028862bE2a173976CA11" as `0x${string}` },

  {
    name: "gdav1Forwarder",
    address: "0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08" as `0x${string}`,
  },

  {
    name: "cfav1Forwarder",
    address: "0xcfA132E353cB4E398080B9700609bb008eceB125" as `0x${string}`,
  },

  {
    name: "superfluidMacroForwarder",
    address: "0xfD01285b9435bc45C243E5e7F978E288B2912de6" as `0x${string}`,
  },

  {
    name: "gdav1Impl",
    address: "0xe3d8455a27f5cb58c2a85aa0bebf0cd49196d308" as `0x${string}`,
  },

  {
    name: "superfluidPool",
    address: "0x9224413b9177e6c1d5721b4a4d1d00ec84b07ce7" as `0x${string}`,
  },
]

export default defineConfig(() => {
  const env = loadEnv({ mode: process.env.NODE_ENV, envDir: process.cwd() })

  return {
    out: "src/generated.ts",
    contracts: [],
    plugins: [
      etherscan({
        apiKey: env.ETHERSCAN_API_KEY,
        chainId: 1,
        tryFetchProxyImplementation: true,
        contracts: [
          {
            name: "gdav1",
            address: {
              1: "0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842" as `0x${string}`,
              10: "0x68Ae17fa7a31b86F306c383277552fd4813b0d35" as `0x${string}`,
              8453: "0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa" as `0x${string}`,
            },
          },
          { name: "nounsToken", address: mainnet.NounsToken as `0x${string}` },
          {
            name: "superfluidImpl",
            address: "0x07e4a282f8f20032f3e766fffb73c8b86ba7e1f1" as `0x${string}`,
          },
          {
            name: "superfluid",
            address: {
              1: "0x4E583d9390082B65Bef884b629DFA426114CED6d",
              10: "0x567c4B141ED61923967cA25Ef4906C8781069a10",
              8453: "0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74",
            },
          },
          {
            name: "cfav1",
            address: {
              1: "0x2844c1BBdA121E9E43105630b9C8310e5c72744b",
              10: "0x204C6f131bb7F258b2Ea1593f5309911d8E458eD",
              8453: "0x19ba78B9cDB05A877718841c574325fdB53601bb",
            },
          },
        ],
      }),
      etherscan({ apiKey: env.ETHERSCAN_API_KEY, chainId: 8453, contracts: baseContracts }),
    ],
  }
})
