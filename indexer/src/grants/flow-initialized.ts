import { Context, ponder } from "ponder:registry"
import { zeroAddress } from "viem"
import { rewardPoolImplAbi } from "../../abis"
import { Status } from "../enums"
import { base as baseContracts } from "../../addresses"
import {
  arbitratorToGrantId,
  baselinePoolToGrantId,
  bonusPoolToGrantId,
  flowContractToGrantId,
  grants,
  parentFlowToChildren,
  rewardPoolContractToGrantId,
  tcrToGrantId,
  tokenEmitterToErc20,
} from "ponder:schema"

ponder.on("NounsFlow:FlowInitialized", async (params) => {
  const { context, event } = params

  const {
    parent: parentContract,
    managerRewardPool,
    superToken,
    baselinePool,
    baselinePoolFlowRatePercent,
    bonusPool,
    managerRewardPoolFlowRatePercent,
  } = event.args

  const contract = context.contracts.NounsFlow.address.toLowerCase() as `0x${string}`

  const [metadata, managerRewardSuperfluidPool] = await Promise.all([
    context.client.readContract({
      address: contract,
      abi: context.contracts.NounsFlow.abi,
      functionName: "flowMetadata",
    }),
    managerRewardPool != zeroAddress
      ? context.client.readContract({
          address: managerRewardPool,
          abi: rewardPoolImplAbi,
          functionName: "rewardPool",
        })
      : Promise.resolve(zeroAddress),
  ])

  // This is because the top level flow has no parent flow contract
  const grantId = contract

  await context.db.insert(grants).values({
    id: grantId,
    ...metadata,
    recipient: contract,
    isTopLevel: true,
    baselinePool: baselinePool.toLowerCase(),
    bonusPool: bonusPool.toLowerCase(),
    isFlow: true,
    isRemoved: false,
    parentContract: parentContract.toLowerCase(),
    managerRewardPool: managerRewardPool.toLowerCase(),
    managerRewardSuperfluidPool: managerRewardSuperfluidPool.toLowerCase(),
    superToken: superToken.toLowerCase(),
    submitter: zeroAddress,
    votesCount: "0",
    monthlyIncomingFlowRate: "0",
    monthlyIncomingBaselineFlowRate: "0",
    monthlyIncomingBonusFlowRate: "0",
    monthlyOutgoingFlowRate: "0",
    monthlyRewardPoolFlowRate: "0",
    monthlyBaselinePoolFlowRate: "0",
    monthlyBonusPoolFlowRate: "0",
    bonusMemberUnits: "0",
    baselineMemberUnits: "0",
    totalEarned: "0",
    activeRecipientCount: 0,
    awaitingRecipientCount: 0,
    challengedRecipientCount: 0,
    tcr: baseContracts.FlowTCR,
    erc20: baseContracts.ERC20VotesMintable,
    arbitrator: baseContracts.ERC20VotesArbitrator,
    tokenEmitter: baseContracts.TokenEmitter,
    managerRewardPoolFlowRatePercent,
    baselinePoolFlowRatePercent,
    challengePeriodEndsAt: 0,
    status: Status.Registered,
    flowId: "",
    updatedAt: Number(event.block.timestamp),
    createdAt: Number(event.block.timestamp),
    isDisputed: false,
    isResolved: false,
    evidenceGroupID: "",
    isActive: true,
  })

  await createMappings(
    context.db,
    contract,
    grantId,
    bonusPool.toLowerCase(),
    baselinePool.toLowerCase()
  )
})

async function createMappings(
  db: Context["db"],
  contract: string,
  grantId: string,
  bonusPool: string,
  baselinePool: string
) {
  await Promise.all([
    db.insert(tokenEmitterToErc20).values({
      tokenEmitter: baseContracts.TokenEmitter,
      erc20: baseContracts.ERC20VotesMintable,
    }),
    db.insert(flowContractToGrantId).values({
      contract,
      grantId,
    }),
    db.insert(tcrToGrantId).values({
      tcr: baseContracts.FlowTCR,
      grantId,
    }),
    db.insert(rewardPoolContractToGrantId).values({
      contract: baseContracts.RewardPool,
      grantId,
    }),
    db.insert(arbitratorToGrantId).values({
      arbitrator: baseContracts.ERC20VotesArbitrator,
      grantId,
    }),
    db.insert(bonusPoolToGrantId).values({
      bonusPool,
      grantId,
    }),
    db.insert(baselinePoolToGrantId).values({
      baselinePool,
      grantId,
    }),
    db.insert(parentFlowToChildren).values({
      parentFlowContract: contract,
      childGrantIds: [],
    }),
  ])
}
