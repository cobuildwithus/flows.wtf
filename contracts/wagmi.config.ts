import { defineConfig, loadEnv } from "@wagmi/cli"
import { etherscan } from "@wagmi/cli/plugins"
import { base, mainnet } from "./addresses"

const mainnetContracts = [{ name: "nounsToken", address: mainnet.NounsToken }]

const baseContracts = [
  { name: "nounsFlowImpl", address: base.NounsFlowImpl },

  { name: "flowTcrImpl", address: base.FlowTCRImpl },

  { name: "erc20VotesArbitratorImpl", address: base.ERC20VotesArbitratorImpl },

  { name: "erc20VotesMintableImpl", address: base.ERC20VotesMintableImpl },

  { name: "tcrFactoryImpl", address: base.TCRFactoryImpl },

  { name: "tokenEmitterImpl", address: base.TokenEmitterImpl },

  { name: "rewardPoolImpl", address: base.RewardPoolImpl },

  { name: "tokenVerifier", address: base.TokenVerifier },

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
    name: "gdav1",
    address: "0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa" as `0x${string}`,
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
      etherscan({ apiKey: env.ETHERSCAN_API_KEY, chainId: 1, contracts: mainnetContracts }),
      etherscan({ apiKey: env.BASESCAN_API_KEY, chainId: 8453, contracts: baseContracts }),
    ],
  }
})
