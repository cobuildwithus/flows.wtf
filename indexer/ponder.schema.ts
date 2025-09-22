import { onchainTable, index, primaryKey } from "ponder"

export const grants = onchainTable(
  "Grant",
  (t) => ({
    id: t.text().primaryKey(),
    recipient: t.text().notNull(),
    recipientId: t.text().notNull(),
    flowId: t.text().notNull(),
    submitter: t.text().notNull(),
    parentContract: t.text().notNull(),
    rootContract: t.text().notNull(),
    isTopLevel: t.boolean().notNull(),
    isFlow: t.boolean().notNull(),
    isSiblingFlow: t.boolean().notNull(),
    title: t.text().notNull(),
    description: t.text().notNull(),
    image: t.text().notNull(),
    tagline: t.text(),
    url: t.text(),
    isRemoved: t.boolean().notNull(),
    isActive: t.boolean().notNull(),
    memberUnits: t.bigint().notNull(),
    monthlyIncomingFlowRate: t.bigint().notNull(),
    monthlyIncomingBaselineFlowRate: t.bigint().notNull(),
    monthlyIncomingBonusFlowRate: t.bigint().notNull(),
    monthlyOutgoingFlowRate: t.bigint().notNull(),
    monthlyRewardPoolFlowRate: t.bigint().notNull(),
    monthlyBaselinePoolFlowRate: t.bigint().notNull(),
    monthlyBonusPoolFlowRate: t.bigint().notNull(),
    bonusMemberUnits: t.bigint().notNull(),
    baselineMemberUnits: t.bigint().notNull(),
    totalEarned: t.bigint().notNull(),
    totalPaidOut: t.bigint().notNull(),
    tcr: t.text(),
    erc20: t.text(),
    arbitrator: t.text(),
    tokenEmitter: t.text(),
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
    manager: t.text().notNull(),
    managerRewardPool: t.text().notNull(),
    managerRewardSuperfluidPool: t.text().notNull(),
    superToken: t.text().notNull(),
    underlyingERC20Token: t.text().notNull(),
    underlyingTokenSymbol: t.text().notNull(),
    underlyingTokenPrefix: t.text().notNull(),
    underlyingTokenName: t.text().notNull(),
    underlyingTokenDecimals: t.integer().notNull(),
    underlyingTokenLogo: t.text(),
    underlyingTokenEthPrice: t.text(),
    underlyingTokenUsdPrice: t.text(),
    jbxProjectId: t.integer(),
    jbxChainId: t.integer(),
    fundraisingTokenEthPrice: t.text(),
    fundraisingTokenUsdPrice: t.text(),
    marketCapUsd: t.text(),
    updatedAt: t.integer().notNull(),
    removedAt: t.integer(),
    activatedAt: t.integer(),
    managerRewardPoolFlowRatePercent: t.integer().notNull(),
    baselinePoolFlowRatePercent: t.integer().notNull(),
    bonusPoolQuorum: t.integer().notNull(),
    totalAllocationWeightOnFlow: t.text().notNull(),
    isOnchainStartup: t.boolean().notNull(),
    isAccelerator: t.boolean().notNull(),
    allocationStrategies: t.text().array().notNull(),
    chainId: t.integer().notNull(),
  }),
  (table) => ({
    isTopLevelIdx: index().on(table.isTopLevel),
    isFlowIdx: index().on(table.isFlow),
    baselinePoolBonusPoolIdx: index().on(table.baselinePool, table.bonusPool),
    isRemovedIdx: index().on(table.isRemoved),
    updatedAtIdx: index().on(table.updatedAt),
    activatedAtIdx: index().on(table.activatedAt),
    flowIdIdx: index().on(table.flowId),
    isDisputedIdx: index().on(table.isDisputed),
    isActiveIdx: index().on(table.isActive),
    arbitratorIdx: index().on(table.arbitrator),
    arbitratorIsFlowIdx: index().on(table.arbitrator, table.isFlow),
    recipientIdx: index().on(table.recipient),
    recipientIsFlowIdx: index().on(table.recipient, table.isFlow),
    recipientParentContractIdx: index().on(table.recipient, table.parentContract),
    rootContractIdx: index().on(table.rootContract),
    recipientManagerRewardPoolIdx: index().on(table.recipient, table.managerRewardPool),
    tcrIsFlowCompoundIdx: index().on(table.tcr, table.isFlow),
    parentContractIsActiveIsRemovedIdx: index().on(
      table.parentContract,
      table.isActive,
      table.isRemoved
    ),
    isAcceleratorIdx: index().on(table.isAccelerator),
    isOnchainStartupIdx: index().on(table.isOnchainStartup),
  })
)

export const allocations = onchainTable(
  "Allocation",
  (t) => ({
    contract: t.text().notNull(),
    allocationKey: t.text().notNull(),
    strategy: t.text().notNull(),
    allocator: t.text().notNull(),
    recipientId: t.text().notNull(),
    chainId: t.integer().notNull(),
    bps: t.integer().notNull(),
    memberUnits: t.text().notNull(),
    committedMemberUnits: t.text().notNull(),
    totalWeight: t.bigint().notNull(),
    blockNumber: t.text().notNull(),
    blockTimestamp: t.integer().notNull(),
    transactionHash: t.text().notNull(),
    logIndex: t.integer().notNull(),
    commitTxHash: t.text().notNull(),
  }),
  (tbl) => ({
    pk: primaryKey({
      columns: [
        tbl.contract,
        tbl.allocationKey,
        tbl.strategy,
        tbl.allocator,
        tbl.recipientId,
        tbl.chainId,
      ],
    }),
    byKey: index().on(tbl.contract, tbl.allocationKey, tbl.strategy, tbl.chainId),
    byAllocator: index().on(
      tbl.contract,
      tbl.allocationKey,
      tbl.strategy,
      tbl.allocator,
      tbl.chainId
    ),
    byRecipient: index().on(tbl.contract, tbl.recipientId, tbl.chainId),
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
    chainId: t.integer().notNull(),
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
    chainId: t.integer().notNull(),
  }),
  (table) => ({
    disputeIdIdx: index().on(table.disputeId),
    arbitratorIdx: index().on(table.arbitrator),
  })
)

export const erc721Tokens = onchainTable(
  "ERC721Token",
  (t) => ({
    id: t.text().primaryKey(),
    contract: t.text().notNull(),
    owner: t.text().notNull(),
    tokenId: t.integer().notNull(),
    burned: t.boolean().notNull(),
    chainId: t.integer().notNull(),
    delegate: t.text().notNull(),
  }),
  (table) => ({
    contractIdx: index().on(table.contract),
    ownerIdx: index().on(table.owner),
    delegateIdx: index().on(table.delegate),
  })
)

export const tokenHolders = onchainTable(
  "TokenHolder",
  (t) => ({
    id: t.text().primaryKey(),
    tokenContract: t.text().notNull(),
    chainId: t.integer().notNull(),
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
    chainId: t.integer().notNull(),
  }),
  (table) => ({
    arbitratorIdx: index().on(table.arbitrator),
    evidenceGroupIDIdx: index().on(table.evidenceGroupID),
  })
)

/**
 * Each allocation strategy that a grant contract is configured with.
 */
export const allocationStrategies = onchainTable(
  "AllocationStrategy",
  (t) => ({
    address: t.text().notNull(), // lower-cased address
    strategyKey: t.text().notNull(), // e.g. "SingleAllocator"
    registeredAt: t.integer().notNull(), // block.timestamp
    chainId: t.integer().notNull(),
  }),
  (tbl) => ({
    strategyAddrChainIdIdx: primaryKey({ columns: [tbl.address, tbl.chainId] }),
    strategyKeyIdx: index().on(tbl.strategyKey),
  })
)

/**
 * Superfluid CFA v1 flows tracking
 */
export const superfluidFlow = onchainTable(
  "SuperfluidFlow",
  (t) => ({
    token: t.text().notNull(),
    sender: t.text().notNull(),
    receiver: t.text().notNull(),
    flowRate: t.text().notNull(), // int96 stored as string
    deposit: t.text().notNull(), // uint256 stored as string
    startTime: t.integer().notNull(), // first non-zero update timestamp
    lastUpdate: t.integer().notNull(), // last update timestamp
    closeTime: t.integer(), // set when flowRate hits 0
    chainId: t.integer().notNull(),
  }),
  (table) => ({
    primaryKey: primaryKey({ columns: [table.token, table.sender, table.receiver, table.chainId] }),
    tokenIdx: index().on(table.token),
    senderIdx: index().on(table.sender),
    receiverIdx: index().on(table.receiver),
    senderReceiverIdx: index().on(table.sender, table.receiver),
    flowRateIdx: index().on(table.flowRate),
    chainIdIdx: index().on(table.chainId),
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

export const tcrAndItemIdToGrantId = onchainTable(
  "_kv_TcrAndItemIdToGrantId",
  (t) => ({
    tcrAndItemId: t.text().primaryKey(),
    grantId: t.text().notNull(),
  }),
  (table) => ({
    grantIdIdx: index().on(table.grantId),
  })
)

export const flowContractAndRecipientIdToGrantId = onchainTable(
  "_kv_FlowContractAndRecipientIdToGrantId",
  (t) => ({
    flowContractAndRecipientId: t.text().primaryKey(),
    grantId: t.text().notNull(),
  })
)

export const siblingFlowAndParentToPreviousFlowRates = onchainTable(
  "_kv_SiblingFlowAndParentToPreviousFlowRates",
  (t) => ({
    siblingFlowAndParent: t.text().primaryKey(),
    previousMonthlyIncomingFlowRate: t.text().notNull(),
    previousMonthlyIncomingBaselineFlowRate: t.text().notNull(),
    previousMonthlyIncomingBonusFlowRate: t.text().notNull(),
  })
)

export const senderAndReceiverToPreviousFlowRate = onchainTable(
  "_kv_SenderAndReceiverToPreviousFlowRate",
  (t) => ({
    sender: t.text().notNull(),
    receiver: t.text().notNull(),
    previousFlowRate: t.text().notNull(),
    chainId: t.integer().notNull(),
  }),
  (table) => ({
    senderReceiverChainIdIdx: primaryKey({
      columns: [table.sender, table.receiver, table.chainId],
    }),
  })
)

export const bonusPoolToGrantId = onchainTable(
  "_kv_BonusPoolToGrantId",
  (t) => ({
    bonusPool: t.text().primaryKey(),
    grantId: t.text().notNull(),
  }),
  () => ({})
)

export const baselinePoolToGrantId = onchainTable(
  "_kv_BaselinePoolToGrantId",
  (t) => ({
    baselinePool: t.text().primaryKey(),
    grantId: t.text().notNull(),
  }),
  () => ({})
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
  () => ({})
)

export const tokenIdsByOwner = onchainTable("_kv_TokenIdsByOwner", (t) => ({
  ownerContractChainId: t.text().primaryKey(),
  tokenIds: t.integer().array().notNull(),
}))

export const lastRecipientsByKeyAllocator = onchainTable(
  "_kv_LastRecipientsByKeyAllocator",
  (t) => ({
    contractKeyAllocator: t.text().primaryKey(),
    recipientIds: t.text().array().notNull(),
    lastCommitTxHash: t.text().notNull(),
    lastBlockNumber: t.text().notNull(),
  }),
  () => ({})
)

export const tempRecipientsByKeyAllocatorTx = onchainTable(
  "_kv_TempRecipientsByKeyAllocatorTx",
  (t) => ({
    contractKeyAllocatorTx: t.text().primaryKey(),
    recipientIds: t.text().array().notNull(),
  }),
  () => ({})
)

export const allocationKeyRegistered = onchainTable(
  "_kv_AllocationKeyRegistered",
  (t) => ({
    contractAllocationKey: t.text().primaryKey(),
    firstSeenBlock: t.text().notNull(),
  }),
  () => ({})
)
