import { ponder, type Context, type Event } from "ponder:registry"
import {
  baselinePoolToGrantId,
  bonusPoolToGrantId,
  grants,
  parentFlowToChildren,
} from "ponder:schema"
import { zeroAddress } from "viem"
import { mainnet } from "viem/chains"
import { mainnet as mainnetContracts } from "../../../addresses"
import { Status } from "../../enums"
import { isAccelerator } from "../recipients/helpers"
import { getFlowMetadataAndRewardPool } from "./initialized-helpers"
import { calculateRootContract } from "../grant-helpers"
import { getSuperTokenPrefix, getSuperTokenSymbol } from "../../utils/super-token-utils"

ponder.on("NounsFlowChildren:FlowInitialized", handleFlowInitialized)

async function handleFlowInitialized(params: {
  event: Event<"NounsFlowChildren:FlowInitialized">
  context: Context<"NounsFlowChildren:FlowInitialized">
}) {
  const { context, event } = params

  const {
    parent,
    manager,
    managerRewardPool,
    superToken,
    baselinePool,
    baselinePoolFlowRatePercent,
    bonusPool,
    managerRewardPoolFlowRatePercent,
  } = event.args

  const contract = event.log.address.toLowerCase() as `0x${string}`
  const parentContract = parent.toLowerCase() as `0x${string}`

  const { metadata, managerRewardSuperfluidPool, underlyingERC20Token } =
    await getFlowMetadataAndRewardPool(context, contract, managerRewardPool, superToken)

  // This is because the top level flow has no parent flow contract
  const grantId = contract
  const rootContract = await calculateRootContract(context.db, contract, parentContract)

  await context.db.insert(grants).values({
    id: grantId,
    chainId: context.chain.id,
    ...metadata,
    recipient: contract,
    recipientId: "", // no parent flow or no recipient id yet
    isTopLevel: false,
    baselinePool: baselinePool.toLowerCase(),
    bonusPool: bonusPool.toLowerCase(),
    isFlow: true,
    isRemoved: false,
    parentContract,
    rootContract,
    managerRewardPool: managerRewardPool.toLowerCase(),
    managerRewardSuperfluidPool: managerRewardSuperfluidPool.toLowerCase(),
    superToken: superToken.toLowerCase(),
    underlyingERC20Token: underlyingERC20Token.toLowerCase(),
    superTokenSymbol: getSuperTokenSymbol(superToken),
    superTokenPrefix: getSuperTokenPrefix(superToken),
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
    tokenEmitter: null,
    manager: manager.toLowerCase(),
    managerRewardPoolFlowRatePercent,
    baselinePoolFlowRatePercent,
    challengePeriodEndsAt: 0,
    status: Status.Registered,
    flowId: parentContract,
    updatedAt: Number(event.block.timestamp),
    createdAt: Number(event.block.timestamp),
    isDisputed: false,
    isResolved: false,
    evidenceGroupID: "",
    isActive: true,
    allocationStrategies: [],
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
