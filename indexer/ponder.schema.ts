import { onchainTable, index } from "ponder"

export const grants = onchainTable(
  "Grant",
  (t) => ({
    id: t.text().primaryKey(),
    recipient: t.text().notNull(),
    flowId: t.text().notNull(),
    submitter: t.text().notNull(),
    parentContract: t.text().notNull(),
    isTopLevel: t.boolean().notNull(),
    isFlow: t.boolean().notNull(),
    title: t.text().notNull(),
    description: t.text().notNull(),
    image: t.text().notNull(),
    tagline: t.text(),
    url: t.text(),
    isRemoved: t.boolean().notNull(),
    isActive: t.boolean().notNull(),
    votesCount: t.text().notNull(),
    monthlyIncomingFlowRate: t.text().notNull(),
    monthlyIncomingBaselineFlowRate: t.text().notNull(),
    monthlyIncomingBonusFlowRate: t.text().notNull(),
    monthlyOutgoingFlowRate: t.text().notNull(),
    monthlyRewardPoolFlowRate: t.text().notNull(),
    monthlyBaselinePoolFlowRate: t.text().notNull(),
    monthlyBonusPoolFlowRate: t.text().notNull(),
    bonusMemberUnits: t.text().notNull(),
    baselineMemberUnits: t.text().notNull(),
    totalEarned: t.text().notNull(),
    tcr: t.text().notNull(),
    erc20: t.text().notNull(),
    arbitrator: t.text().notNull(),
    tokenEmitter: t.text().notNull(),
    status: t.integer().notNull(),
    challengePeriodEndsAt: t.integer().notNull(),
    isDisputed: t.boolean().notNull(),
    isResolved: t.boolean().notNull(),
    evidenceGroupID: t.text().notNull(),
    createdAt: t.integer().notNull(),
    baselinePool: t.text().notNull(),
    activeRecipientCount: t.integer().notNull(),
    awaitingRecipientCount: t.integer().notNull(),
    challengedRecipientCount: t.integer().notNull(),
    bonusPool: t.text().notNull(),
    managerRewardPool: t.text().notNull(),
    managerRewardSuperfluidPool: t.text().notNull(),
    superToken: t.text().notNull(),
    updatedAt: t.integer().notNull(),
    managerRewardPoolFlowRatePercent: t.integer().notNull(),
    baselinePoolFlowRatePercent: t.integer().notNull(),
  }),
  (table) => ({
    isTopLevelIdx: index().on(table.isTopLevel),
    isFlowIdx: index().on(table.isFlow),
    baselinePoolBonusPoolIdx: index().on(table.baselinePool, table.bonusPool),
    isRemovedIdx: index().on(table.isRemoved),
    updatedAtIdx: index().on(table.updatedAt),
    flowIdIdx: index().on(table.flowId),
    isDisputedIdx: index().on(table.isDisputed),
    isActiveIdx: index().on(table.isActive),
    arbitratorIdx: index().on(table.arbitrator),
    arbitratorIsFlowIdx: index().on(table.arbitrator, table.isFlow),
    recipientIdx: index().on(table.recipient),
    recipientIsFlowIdx: index().on(table.recipient, table.isFlow),
    recipientParentContractIdx: index().on(table.recipient, table.parentContract),
    recipientManagerRewardPoolIdx: index().on(table.recipient, table.managerRewardPool),
    tcrIsFlowCompoundIdx: index().on(table.tcr, table.isFlow),
    parentContractIsActiveIsRemovedIdx: index().on(
      table.parentContract,
      table.isActive,
      table.isRemoved
    ),
  })
)

export const votes = onchainTable(
  "Vote",
  (t) => ({
    id: t.text().primaryKey(),
    contract: t.text().notNull(),
    recipientId: t.text().notNull(),
    tokenId: t.text().notNull(),
    bps: t.integer().notNull(),
    voter: t.text().notNull(),
    blockNumber: t.text().notNull(),
    blockTimestamp: t.integer().notNull(),
    transactionHash: t.text().notNull(),
    votesCount: t.text().notNull(),
  }),
  (table) => ({
    voterIdx: index().on(table.voter),
    contractIdx: index().on(table.contract),
    recipientIdIdx: index().on(table.recipientId),
  })
)

export const disputes = onchainTable(
  "Dispute",
  (t) => ({
    id: t.text().primaryKey(),
    disputeId: t.text().notNull(),
    arbitrator: t.text().notNull(),
    arbitrable: t.text().notNull(),
    grantId: t.text().notNull(),
    challenger: t.text().notNull(),
    votingStartTime: t.integer().notNull(),
    votingEndTime: t.integer().notNull(),
    revealPeriodEndTime: t.integer().notNull(),
    creationBlock: t.integer().notNull(),
    arbitrationCost: t.text().notNull(),
    votes: t.text().notNull(),
    requesterPartyVotes: t.text().notNull(),
    challengerPartyVotes: t.text().notNull(),
    ruling: t.integer().notNull(),
    totalSupply: t.text().notNull(),
    isExecuted: t.boolean().notNull(),
    evidenceGroupID: t.text().notNull(),
  }),
  (table) => ({
    arbitratorIdx: index().on(table.arbitrator),
    disputeIdIdx: index().on(table.disputeId),
    grantIdIdx: index().on(table.grantId),
    evidenceGroupIDIdx: index().on(table.evidenceGroupID),
  })
)

export const disputeVotes = onchainTable(
  "DisputeVote",
  (t) => ({
    id: t.text().primaryKey(),
    arbitrator: t.text().notNull(),
    disputeId: t.text().notNull(),
    commitHash: t.text().notNull(),
    committedAt: t.integer().notNull(),
    voter: t.text().notNull(),
    revealedBy: t.text(),
    revealedAt: t.integer(),
    choice: t.integer(),
    votes: t.text(),
    reason: t.text(),
  }),
  (table) => ({
    disputeIdIdx: index().on(table.disputeId),
    arbitratorIdx: index().on(table.arbitrator),
  })
)

export const tokenHolders = onchainTable(
  "TokenHolder",
  (t) => ({
    id: t.text().primaryKey(),
    tokenContract: t.text().notNull(),
    holder: t.text().notNull(),
    firstPurchase: t.integer().notNull(),
    amount: t.text().notNull(),
    totalBought: t.text().notNull(),
    totalSold: t.text().notNull(),
    costBasis: t.text().notNull(),
    totalSaleProceeds: t.text().notNull(),
  }),
  (table) => ({
    tokenContractIdx: index().on(table.tokenContract),
    holderIdx: index().on(table.holder),
  })
)

export const evidence = onchainTable(
  "Evidence",
  (t) => ({
    id: t.text().primaryKey(),
    arbitrator: t.text().notNull(),
    evidenceGroupID: t.text().notNull(),
    evidence: t.text().notNull(),
    party: t.text().notNull(),
    blockNumber: t.text().notNull(),
  }),
  (table) => ({
    arbitratorIdx: index().on(table.arbitrator),
    evidenceGroupIDIdx: index().on(table.evidenceGroupID),
  })
)

/**
 * Lookup tables
 */

export const tokenEmitterToErc20 = onchainTable(
  "_kv_TokenEmitterToErc20",
  (t) => ({
    tokenEmitter: t.text().primaryKey(),
    erc20: t.text().notNull(),
  }),
  (table) => ({
    erc20Idx: index().on(table.erc20),
  })
)

export const flowContractToGrantId = onchainTable(
  "_kv_FlowContractToGrantId",
  (t) => ({
    contract: t.text().primaryKey(),
    grantId: t.text().notNull(),
  }),
  (table) => ({
    grantIdIdx: index().on(table.grantId),
  })
)

export const arbitratorToGrantId = onchainTable(
  "_kv_ArbitratorToGrantId",
  (t) => ({
    arbitrator: t.text().primaryKey(),
    grantId: t.text().notNull(),
  }),
  (table) => ({
    grantIdIdx: index().on(table.grantId),
  })
)

export const tcrToGrantId = onchainTable(
  "_kv_TcrToGrantId",
  (t) => ({
    tcr: t.text().primaryKey(),
    grantId: t.text().notNull(),
  }),
  (table) => ({
    grantIdIdx: index().on(table.grantId),
  })
)

export const bonusPoolToGrantId = onchainTable(
  "_kv_BonusPoolToGrantId",
  (t) => ({
    bonusPool: t.text().primaryKey(),
    grantId: t.text().notNull(),
  }),
  (table) => ({})
)

export const baselinePoolToGrantId = onchainTable(
  "_kv_BaselinePoolToGrantId",
  (t) => ({
    baselinePool: t.text().primaryKey(),
    grantId: t.text().notNull(),
  }),
  (table) => ({})
)

export const rewardPoolContractToGrantId = onchainTable(
  "_kv_RewardPoolContractToGrantId",
  (t) => ({
    contract: t.text().primaryKey(),
    grantId: t.text().notNull(),
  }),
  (table) => ({
    grantIdIdx: index().on(table.grantId),
  })
)

export const recipientAndParentToGrantId = onchainTable(
  "_kv_RecipientAndParentToGrantId",
  (t) => ({
    recipientAndParent: t.text().primaryKey(),
    grantId: t.text().notNull(),
  }),
  (table) => ({
    grantIdIdx: index().on(table.grantId),
    recipientAndParentIdx: index().on(table.recipientAndParent),
  })
)

export const parentFlowToChildren = onchainTable(
  "_kv_ParentFlowToChildren",
  (t) => ({
    parentFlowContract: t.text().primaryKey(),
    childGrantIds: t.text().array().notNull(),
  }),
  (table) => ({})
)

export const votesByTokenIdAndContract = onchainTable(
  "_kv_VotesByTokenIdAndContract",
  (t) => ({
    contractTokenId: t.text().primaryKey(),
    voteIds: t.text().array().notNull(),
  }),
  (table) => ({})
)
