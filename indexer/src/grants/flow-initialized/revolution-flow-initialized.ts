import { ponder, type Context, type Event } from "ponder:registry"
import { zeroAddress } from "viem"
import { Status } from "../../enums"
import {
  baselinePoolToGrantId,
  bonusPoolToGrantId,
  grants,
  parentFlowToChildren,
} from "ponder:schema"
import { getFlowMetadataAndRewardPool } from "./initialized-helpers"
import { base } from "../../../addresses"

ponder.on("RevolutionFlow:FlowInitialized", handleFlowInitialized)
ponder.on("RevolutionFlowChildren:FlowInitialized", handleFlowInitialized)

async function handleFlowInitialized(params: {
  event: Event<"RevolutionFlow:FlowInitialized">
  context: Context<"RevolutionFlow:FlowInitialized">
}) {
  const { context, event } = params

  const {
    parent,
    managerRewardPool,
    superToken,
    baselinePool,
    baselinePoolFlowRatePercent,
    bonusPool,
    managerRewardPoolFlowRatePercent,
  } = event.args

  const contract = event.log.address.toLowerCase() as `0x${string}`
  const parentContract = parent.toLowerCase() as `0x${string}`

  const { metadata, managerRewardSuperfluidPool } = await getFlowMetadataAndRewardPool(
    context,
    contract,
    managerRewardPool
  )

  // This is because the top level flow has no parent flow contract
  const grantId = contract

  const isTopLevel = contract === base.VrbsFlow

  await context.db.insert(grants).values({
    id: grantId,
    ...metadata,
    recipient: contract,
    recipientId: "",
    isTopLevel,
    baselinePool: baselinePool.toLowerCase(),
    bonusPool: bonusPool.toLowerCase(),
    isFlow: true,
    isRemoved: false,
    parentContract,
    managerRewardPool: managerRewardPool.toLowerCase(),
    managerRewardSuperfluidPool: managerRewardSuperfluidPool.toLowerCase(),
    superToken: superToken.toLowerCase(),
    submitter: zeroAddress,
    votesCount: "0",
    totalVoteWeightCastOnFlow: "0",
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
    bonusPoolQuorum: 0,
    tcr: null,
    erc20: null,
    isOnchainStartup: false,
    arbitrator: null,
    tokenEmitter: null,
    managerRewardPoolFlowRatePercent,
    baselinePoolFlowRatePercent,
    challengePeriodEndsAt: 0,
    status: Status.Registered,
    flowId: isTopLevel ? "" : parentContract,
    updatedAt: Number(event.block.timestamp),
    createdAt: Number(event.block.timestamp),
    isDisputed: false,
    isResolved: false,
    evidenceGroupID: "",
    isActive: true,
    votingTokenChainId: context.network.chainId, // assumes all these flows are voting on the same network they're deployed on
  })

  await createMappings(
    context.db,
    contract,
    grantId,
    bonusPool.toLowerCase(),
    baselinePool.toLowerCase()
  )
}

async function createMappings(
  db: Context["db"],
  contract: string,
  grantId: string,
  bonusPool: string,
  baselinePool: string
) {
  await Promise.all([
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
