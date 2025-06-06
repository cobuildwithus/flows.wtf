import { ponder, type Context } from "ponder:registry"
import { rewardPoolImplAbi } from "../../abis"
import {
  arbitratorToGrantId,
  grants,
  rewardPoolContractToGrantId,
  tcrToGrantId,
  tokenEmitterToErc20,
} from "ponder:schema"

ponder.on("NounsFlowTcrFactory:FlowTCRDeployed", async (params) => {
  const { event, context } = params

  const {
    flowTCRProxy,
    arbitratorProxy,
    erc20Proxy,
    flowProxy,
    tokenEmitterProxy,
    rewardPoolProxy,
  } = event.args

  const grantId = flowProxy.toLowerCase()

  const [superToken, managerRewardSuperfluidPool, parentContract] = await Promise.all([
    context.client.readContract({
      address: flowProxy,
      abi: context.contracts.NounsFlow.abi,
      functionName: "superToken",
    }),
    context.client.readContract({
      address: rewardPoolProxy,
      abi: rewardPoolImplAbi,
      functionName: "rewardPool",
    }),
    context.client.readContract({
      address: flowProxy,
      abi: context.contracts.NounsFlow.abi,
      functionName: "parent",
    }),
  ])

  await context.db.update(grants, { id: grantId }).set({
    superToken: superToken.toLowerCase(),
    tcr: flowTCRProxy.toLowerCase(),
    arbitrator: arbitratorProxy.toLowerCase(),
    erc20: erc20Proxy.toLowerCase(),
    parentContract: parentContract.toLowerCase(),
    tokenEmitter: tokenEmitterProxy.toLowerCase(),
    managerRewardPool: rewardPoolProxy.toLowerCase(),
    managerRewardSuperfluidPool: managerRewardSuperfluidPool.toLowerCase(),
  })

  await createMappings(
    context.db,
    tokenEmitterProxy,
    erc20Proxy,
    rewardPoolProxy,
    flowTCRProxy,
    arbitratorProxy,
    grantId
  )
})

async function createMappings(
  db: Context["db"],
  tokenEmitterProxy: `0x${string}`,
  erc20Proxy: `0x${string}`,
  rewardPoolProxy: `0x${string}`,
  flowTCRProxy: `0x${string}`,
  arbitratorProxy: `0x${string}`,
  grantId: string
) {
  await Promise.all([
    db.insert(tokenEmitterToErc20).values({
      tokenEmitter: tokenEmitterProxy.toLowerCase(),
      erc20: erc20Proxy.toLowerCase(),
    }),
    db.insert(tcrToGrantId).values({
      tcr: flowTCRProxy.toLowerCase(),
      grantId,
    }),
    db.insert(rewardPoolContractToGrantId).values({
      contract: rewardPoolProxy.toLowerCase(),
      grantId,
    }),
    db.insert(arbitratorToGrantId).values({
      arbitrator: arbitratorProxy.toLowerCase(),
      grantId,
    }),
  ])
}
