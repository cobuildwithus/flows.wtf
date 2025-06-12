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
import { accelerators, customFlows } from "../../../addresses"
import { isAccelerator } from "../recipients/helpers"

ponder.on("CustomFlow:FlowInitialized", handleFlowInitialized)

async function handleFlowInitialized(params: {
  event: Event<"CustomFlow:FlowInitialized">
  context: Context<"CustomFlow:FlowInitialized">
}) {
  const { context, event } = params

  const {
    parent,
    managerRewardPool,
    superToken,
    baselinePool,
    baselinePoolFlowRatePercent,
    bonusPool,
    manager,
    managerRewardPoolFlowRatePercent,
    strategies,
  } = event.args

  const contract = event.log.address.toLowerCase() as `0x${string}`
  const parentContract = parent.toLowerCase() as `0x${string}`

  // const parentFlow = await context.db.find(grants, { id: parentContract })

  const { metadata, managerRewardSuperfluidPool } = await getFlowMetadataAndRewardPool(
    context,
    contract,
    managerRewardPool
  )

  // This is because the top level flow has no parent flow contract
  const grantId = contract

  const isTopLevel = isTopLevelFlow(contract)

  await context.db.insert(grants).values({
    id: grantId,
    chainId: context.chain.id,
    ...metadata,
    recipient: contract,
    recipientId: "",
    allocationStrategies: strategies.map((strategy) => strategy.toLowerCase()),
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
    allocationsCount: "0",
    totalAllocationWeightOnFlow: "0",
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
    isAccelerator: isAccelerator(contract),
    arbitrator: null,
    manager: manager.toLowerCase(),
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

const isTopLevelFlow = (contract: string) => {
  return (
    contract === customFlows.gnars ||
    contract === customFlows.grounds ||
    contract === accelerators.vrbs
  )
}
