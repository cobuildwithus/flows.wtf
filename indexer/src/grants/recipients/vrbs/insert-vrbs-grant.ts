import { grants } from "ponder:schema"
import { Context } from "ponder:registry"
import { Status } from "../../../enums"

type GrantInsertParams = {
  id: string
  metadata: { title: string; description: string; image: string; tagline: string; url: string }
  recipient: string
  flowId: string
  submitter: string
  parentContract: string
  baselinePool?: string
  bonusPool?: string
  managerRewardPoolFlowRatePercent?: number
  baselinePoolFlowRatePercent?: number
  createdAt: number
  updatedAt: number
}

export async function insertGrant(db: Context["db"], params: GrantInsertParams) {
  const {
    id,
    metadata,
    recipient,
    flowId,
    submitter,
    parentContract,
    baselinePool = "",
    bonusPool = "",
    managerRewardPoolFlowRatePercent = 0,
    baselinePoolFlowRatePercent = 0,
    createdAt,
    updatedAt,
  } = params

  return db.insert(grants).values({
    id,
    ...metadata,
    recipient,
    flowId,
    submitter,
    parentContract,
    baselinePool,
    bonusPool,
    managerRewardPoolFlowRatePercent,
    baselinePoolFlowRatePercent,
    isTopLevel: false,
    isFlow: true,
    isRemoved: false,
    votesCount: "0",
    bonusPoolQuorum: 0,
    totalVoteWeightCastOnFlow: "0",
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
    activeRecipientCount: 0,
    awaitingRecipientCount: 0,
    challengedRecipientCount: 0,
    tcr: null,
    erc20: "",
    arbitrator: "",
    tokenEmitter: "",
    superToken: "",
    managerRewardPool: "",
    managerRewardSuperfluidPool: "",
    status: Status.Registered,
    isDisputed: false,
    isResolved: false,
    evidenceGroupID: "",
    isActive: true,
    createdAt,
    updatedAt,
  })
}
