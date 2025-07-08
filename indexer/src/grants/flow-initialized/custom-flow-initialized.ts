import { ponder, type Context, type Event } from "ponder:registry"
import { zeroAddress } from "viem"
import { Status } from "../../enums"
import {
  baselinePoolToGrantId,
  bonusPoolToGrantId,
  grants,
  parentFlowToChildren,
} from "ponder:schema"
import { calculateRootContract } from "../grant-helpers"
import { getFlowMetadataAndRewardPool } from "./initialized-helpers"
import { isAccelerator } from "../recipients/helpers"
import { fetchTokenInfo } from "../../utils/token-utils"

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

  const { metadata, managerRewardSuperfluidPool, underlyingERC20Token } =
    await getFlowMetadataAndRewardPool(context, contract, managerRewardPool, superToken)

  const {
    symbol: underlyingTokenSymbol,
    prefix: underlyingTokenPrefix,
    name: underlyingTokenName,
    decimals: underlyingTokenDecimals,
    logo: underlyingTokenLogo,
  } = await fetchTokenInfo(context, underlyingERC20Token)

  // This is because the top level flow has no parent flow contract
  const grantId = contract

  const isTopLevel = parentContract === zeroAddress
  const rootContract = await calculateRootContract(context.db, contract, parentContract)

  await context.db.insert(grants).values({
    id: grantId,
    chainId: context.chain.id,
    ...metadata,
    recipient: contract,
    recipientId: "",
    allocationStrategies: strategies.map((strategy) => strategy.toLowerCase()),
    isTopLevel,
    isSiblingFlow: false,
    baselinePool: baselinePool.toLowerCase(),
    bonusPool: bonusPool.toLowerCase(),
    activatedAt: Number(event.block.timestamp),
    isFlow: true,
    isRemoved: false,
    parentContract,
    rootContract,
    managerRewardPool: managerRewardPool.toLowerCase(),
    managerRewardSuperfluidPool: managerRewardSuperfluidPool.toLowerCase(),
    superToken: superToken.toLowerCase(),
    underlyingTokenSymbol,
    underlyingTokenPrefix,
    underlyingTokenName,
    underlyingTokenDecimals,
    underlyingTokenLogo,
    underlyingERC20Token: underlyingERC20Token.toLowerCase(),
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
