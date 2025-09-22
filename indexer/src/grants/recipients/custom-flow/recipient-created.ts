import { ponder, type Context, type Event } from "ponder:registry"
import { getFlow, isOnchainStartup } from "../helpers"
import { handleRecipientMappings } from "../mappings/eoa-mappings"
import { RecipientType, Status } from "../../../enums"
import {
  addGrantIdToFlowContractAndRecipientId,
  buildCanonicalRecipientGrantId,
} from "../../grant-helpers"
import { grants } from "ponder:schema"

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
  const grantId = recipientId.toString()
  const timestamp = Number(event.block.timestamp)
  const flow = await getFlow(context.db, flowAddress)
  const rootContract = flow.rootContract

  await context.db.update(grants, { id: flow.id }).set((row) => ({
    activeRecipientCount: row.activeRecipientCount + 1,
  }))

  if (recipientType === RecipientType.FlowContract) {
    return
  }

  const existingRecipient = await context.db.find(grants, { id: recipient })

  const canonicalId = buildCanonicalRecipientGrantId(flowAddress, grantId)

  const grant = await context.db.insert(grants).values({
    id: canonicalId,
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
    memberUnits: "0",
    isOnchainStartup: isOnchainStartup(flowAddress),
    isAccelerator: false,
    bonusPoolQuorum: 0,
    totalAllocationWeightOnFlow: "0",
    monthlyIncomingFlowRate: "0",
    monthlyIncomingBaselineFlowRate: "0",
    monthlyIncomingBonusFlowRate: "0",
    monthlyOutgoingFlowRate: "0",
    monthlyRewardPoolFlowRate: "0",
    challengePeriodEndsAt: 0,
    monthlyBaselinePoolFlowRate: "0",
    monthlyBonusPoolFlowRate: "0",
    bonusMemberUnits: "0",
    baselineMemberUnits: "0",
    totalEarned: "0",
    totalPaidOut: "0",
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
}
