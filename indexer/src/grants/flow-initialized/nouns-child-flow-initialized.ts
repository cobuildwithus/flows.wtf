import { ponder, type Context, type Event } from "ponder:registry"
import { grants, parentFlowToChildren, poolToParent } from "ponder:schema"
import { zeroAddress } from "viem"
import { Status } from "../../enums"
import { isAccelerator } from "../recipients/helpers"
import { getFlowMetadataAndRewardPool } from "./initialized-helpers"
import { calculateRootContract } from "../grant-helpers"
import { fetchTokenInfo } from "../../utils/token-utils"

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
    flowImpl,
  } = event.args

  const contract = event.log.address.toLowerCase() as `0x${string}`
  const parentContract = parent.toLowerCase() as `0x${string}`

  const { metadata, underlyingERC20Token } = await getFlowMetadataAndRewardPool(
    context,
    contract,
    superToken
  )

  const {
    symbol: underlyingTokenSymbol,
    prefix: underlyingTokenPrefix,
    name: underlyingTokenName,
    decimals: underlyingTokenDecimals,
    logo: underlyingTokenLogo,
  } = await fetchTokenInfo(context, underlyingERC20Token)

  // This is because the top level flow has no parent flow contract
  const grantId = contract
  const rootContract = await calculateRootContract(context.db, contract, parentContract)

  await context.db.insert(grants).values({
    id: grantId,
    chainId: context.chain.id,
    flowImpl,
    ...metadata,
    recipient: contract,
    recipientId: "", // no parent flow or no recipient id yet
    isTopLevel: false,
    baselinePool: baselinePool.toLowerCase(),
    bonusPool: bonusPool.toLowerCase(),
    isFlow: true,
    isSiblingFlow: false,
    isRemoved: false,
    parentContract,
    rootContract,
    managerRewardPool: managerRewardPool.toLowerCase(),
    managerRewardSuperfluidPool: "",
    superToken: superToken.toLowerCase(),
    underlyingERC20Token: underlyingERC20Token.toLowerCase(),
    underlyingTokenSymbol,
    underlyingTokenPrefix,
    underlyingTokenName,
    underlyingTokenDecimals,
    underlyingTokenLogo,
    submitter: zeroAddress,
    memberUnits: 0n,
    totalAllocationWeightOnFlow: "0",
    monthlyIncomingFlowRate: 0n,
    monthlyIncomingBaselineFlowRate: 0n,
    monthlyIncomingBonusFlowRate: 0n,
    monthlyOutgoingFlowRate: 0n,
    monthlyRewardPoolFlowRate: 0n,
    monthlyBaselinePoolFlowRate: 0n,
    monthlyBonusPoolFlowRate: 0n,
    bonusMemberUnits: 0n,
    baselineMemberUnits: 0n,
    totalEarned: 0n,
    totalPaidOut: 0n,
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
    db.insert(poolToParent).values({ pool: bonusPool, grantId, kind: "bonus" }),
    db.insert(poolToParent).values({ pool: baselinePool, grantId, kind: "baseline" }),
    db.insert(parentFlowToChildren).values({
      parentFlowContract: contract,
      childGrantIds: [],
    }),
  ])
}
