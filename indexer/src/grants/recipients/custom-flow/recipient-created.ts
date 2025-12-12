import { ponder, type Context, type Event } from "ponder:registry"
import { getFlow, isOnchainStartup } from "../helpers"
import { handleRecipientMappings } from "../mappings/eoa-mappings"
import { RecipientType, Status } from "../../../enums"
import {
  addGrantIdToFlowContractAndRecipientId,
  buildCanonicalRecipientGrantId,
} from "../../grant-helpers"
import { grants } from "ponder:schema"
import { upsertGrantIdForTcrAndItemId } from "../../../tcr/tcr-helpers"

ponder.on("CustomFlow:RecipientCreated", handleRecipientCreated)

async function handleRecipientCreated(params: {
  event: Event<"CustomFlow:RecipientCreated">
  context: Context<"CustomFlow:RecipientCreated">
}) {
  const { event, context } = params
  const {
    recipient: { recipient: rawRecipient, metadata, recipientType },
    recipientId,
    approvedBy,
  } = event.args

  const recipient = rawRecipient.toLowerCase()
  const flowAddress = event.log.address.toLowerCase()
  const grantId = recipientId.toString().toLowerCase()
  const timestamp = Number(event.block.timestamp)
  const flow = await getFlow(context.db, flowAddress)
  const rootContract = flow.rootContract

  if (recipientType === RecipientType.FlowContract) {
    return
  }

  const existingRecipient = await context.db.find(grants, { id: recipient })

  const canonicalId = buildCanonicalRecipientGrantId(flowAddress, grantId)
  const existingGrantWithCanonicalId = await context.db.find(grants, { id: canonicalId })
  const versionedId = existingGrantWithCanonicalId
    ? `${canonicalId}-${event.transaction.hash}`
    : canonicalId

  const grant = await context.db.insert(grants).values({
    id: versionedId,
    chainId: context.chain.id,
    title: metadata.title,
    recipientId: grantId,
    description: metadata.description,
    manager: "",
    activatedAt: timestamp,
    image: metadata.image,
    tagline: metadata.tagline,
    url: metadata.url,
    recipient,
    flowId: flow.id,
    submitter: approvedBy.toLowerCase(),
    parentContract: flowAddress,
    rootContract,
    baselinePool: "",
    bonusPool: "",
    managerRewardPoolFlowRatePercent: 0,
    baselinePoolFlowRatePercent: 0,
    isTopLevel: false,
    isFlow: false,
    isSiblingFlow: existingRecipient?.isFlow ? true : false,
    isRemoved: false,
    memberUnits: 0n,
    isOnchainStartup: isOnchainStartup(flowAddress),
    isAccelerator: false,
    bonusPoolQuorum: 0,
    totalAllocationWeightOnFlow: "0",
    monthlyIncomingFlowRate: 0n,
    monthlyIncomingBaselineFlowRate: 0n,
    monthlyIncomingBonusFlowRate: 0n,
    monthlyOutgoingFlowRate: 0n,
    monthlyRewardPoolFlowRate: 0n,
    challengePeriodEndsAt: 0,
    monthlyBaselinePoolFlowRate: 0n,
    monthlyBonusPoolFlowRate: 0n,
    bonusMemberUnits: 0n,
    baselineMemberUnits: 0n,
    totalEarned: 0n,
    totalPaidOut: 0n,
    activeRecipientCount: 0,
    awaitingRecipientCount: 0,
    challengedRecipientCount: 0,
    tcr: null,
    erc20: null,
    arbitrator: null,
    tokenEmitter: null,
    superToken: flow.superToken,
    underlyingTokenSymbol: flow.underlyingTokenSymbol,
    underlyingTokenPrefix: flow.underlyingTokenPrefix,
    underlyingTokenName: flow.underlyingTokenName,
    underlyingTokenDecimals: flow.underlyingTokenDecimals,
    underlyingTokenLogo: flow.underlyingTokenLogo,
    underlyingERC20Token: flow.underlyingERC20Token,
    managerRewardPool: "",
    managerRewardSuperfluidPool: "",
    status: Status.Registered,
    isDisputed: false,
    isResolved: false,
    evidenceGroupID: "",
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    allocationStrategies: [],
  })

  await handleRecipientMappings(context.db, recipient, flowAddress, grant.id)
  await addGrantIdToFlowContractAndRecipientId(context.db, flowAddress, recipientId, grant.id)
  if (flow.tcr) {
    await upsertGrantIdForTcrAndItemId(context.db, flow.tcr, grantId, grant.id)
  }

  await context.db.update(grants, { id: flow.id }).set((row) => ({
    activeRecipientCount: row.activeRecipientCount + 1,
  }))
}
