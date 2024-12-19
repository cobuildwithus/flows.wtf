import { ponder, type Context, type Event } from "ponder:registry"
import { decodeAbiParameters, getAddress } from "viem"
import { RecipientType, Status } from "../enums"
import { addApplicationEmbedding } from "./embeddings/embed-applications"
import { grants, tcrToGrantId } from "ponder:schema"

ponder.on("FlowTcr:ItemSubmitted", handleItemSubmitted)
ponder.on("FlowTcrChildren:ItemSubmitted", handleItemSubmitted)

async function handleItemSubmitted(params: {
  event: Event<"FlowTcr:ItemSubmitted">
  context: Context<"FlowTcr:ItemSubmitted">
}) {
  const { event, context } = params
  const tcr = event.log.address.toLowerCase()

  const { _submitter, _data, _itemID, _evidenceGroupID } = event.args

  const flow = await getFlowFromTcr(context.db, tcr)

  const [recipient, metadata, recipientType] = decodeAbiParameters(
    [
      { name: "recipient", type: "address" },
      {
        name: "metadata",
        type: "tuple",
        components: [
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "image", type: "string" },
          { name: "tagline", type: "string" },
          { name: "url", type: "string" },
        ],
      },
      { name: "recipientType", type: "uint8" },
    ],
    _data
  )

  const challengePeriodDuration = await context.client.readContract({
    address: getAddress(tcr),
    abi: context.contracts.FlowTcr.abi,
    functionName: "challengePeriodDuration",
  })

  await context.db.insert(grants).values({
    id: _itemID,
    ...metadata,
    isActive: false,
    recipient: recipient.toString(),
    flowId: flow.id,
    submitter: _submitter.toLowerCase(),
    parentContract: flow.recipient,
    isTopLevel: false,
    isFlow: recipientType === RecipientType.FlowContract,
    isRemoved: false,
    votesCount: "0",
    monthlyIncomingFlowRate: "0",
    monthlyIncomingBaselineFlowRate: "0",
    monthlyIncomingBonusFlowRate: "0",
    monthlyOutgoingFlowRate: "0",
    monthlyRewardPoolFlowRate: "0",
    challengePeriodEndsAt: Number(event.block.timestamp + challengePeriodDuration),
    monthlyBaselinePoolFlowRate: "0",
    monthlyBonusPoolFlowRate: "0",
    bonusMemberUnits: "0",
    baselineMemberUnits: "0",
    totalEarned: "0",
    activeRecipientCount: 0,
    awaitingRecipientCount: 0,
    challengedRecipientCount: 0,
    tcr: "",
    erc20: "",
    arbitrator: "",
    tokenEmitter: "",
    superToken: "",
    managerRewardPool: "",
    managerRewardSuperfluidPool: "",
    managerRewardPoolFlowRatePercent: 0,
    baselinePoolFlowRatePercent: 0,
    baselinePool: "",
    bonusPool: "",
    status: Status.RegistrationRequested,
    isDisputed: false,
    isResolved: false,
    evidenceGroupID: _evidenceGroupID.toString(),
    createdAt: Number(event.block.timestamp),
    updatedAt: Number(event.block.timestamp),
  })

  const grant = await context.db
    .update(grants, { id: flow.id })
    .set({ awaitingRecipientCount: flow.awaitingRecipientCount + 1 })

  if (!grant) throw new Error("Grant not found")

  await addApplicationEmbedding(grant, flow.id)
}

async function getFlowFromTcr(db: Context["db"], tcr: string) {
  const flowId = await db.find(tcrToGrantId, {
    tcr,
  })
  if (!flowId) throw new Error("Flow ID not found for TCR item")

  const flow = await db.find(grants, {
    id: flowId.grantId,
  })
  if (!flow) throw new Error("Flow not found for TCR item")

  return flow
}
