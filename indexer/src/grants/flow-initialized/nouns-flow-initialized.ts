import { ponder, type Context, type Event } from "ponder:registry"
import { zeroAddress } from "viem"
import { Status } from "../../enums"
import { base as baseContracts } from "../../../addresses"
import {
  arbitratorToGrantId,
  baselinePoolToGrantId,
  bonusPoolToGrantId,
  grants,
  parentFlowToChildren,
  rewardPoolContractToGrantId,
  tcrToGrantId,
  tokenEmitterToErc20,
} from "ponder:schema"
import { getFlowMetadataAndRewardPool } from "./initialized-helpers"
import { isAccelerator } from "../recipients/helpers"
import { calculateRootContract } from "../grant-helpers"
import { fetchTokenInfo } from "../../utils/token-utils"

ponder.on("NounsFlow:FlowInitialized", handleFlowInitialized)

async function handleFlowInitialized(params: {
  event: Event<"NounsFlow:FlowInitialized">
  context: Context<"NounsFlow:FlowInitialized">
}) {
  const { context, event } = params

  const {
    parent,
    managerRewardPool,
    superToken,
    baselinePool,
    manager,
    baselinePoolFlowRatePercent,
    bonusPool,
    managerRewardPoolFlowRatePercent,
    flowImpl,
  } = event.args

  const contract = event.log.address.toLowerCase() as `0x${string}`
  const parentContract = parent.toLowerCase() as `0x${string}`

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
  const rootContract = await calculateRootContract(context.db, contract, parentContract)

  await context.db.insert(grants).values({
    id: grantId,
    chainId: context.chain.id,
    flowImpl,
    ...metadata,
    recipient: contract,
    isTopLevel: true,
    recipientId: "", // no parent flow
    baselinePool: baselinePool.toLowerCase(),
    bonusPool: bonusPool.toLowerCase(),
    isFlow: true,
    isSiblingFlow: false,
    isRemoved: false,
    parentContract,
    rootContract,
    managerRewardPool: managerRewardPool.toLowerCase(),
    managerRewardSuperfluidPool: managerRewardSuperfluidPool.toLowerCase(),
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
    isOnchainStartup: false,
    isAccelerator: isAccelerator(contract),
    monthlyBonusPoolFlowRate: 0n,
    bonusMemberUnits: 0n,
    baselineMemberUnits: 0n,
    totalEarned: 0n,
    totalPaidOut: 0n,
    activeRecipientCount: 0,
    awaitingRecipientCount: 0,
    challengedRecipientCount: 0,
    bonusPoolQuorum: 0,
    tcr: baseContracts.FlowTCR,
    erc20: baseContracts.ERC20VotesMintable,
    arbitrator: baseContracts.ERC20VotesArbitrator,
    tokenEmitter: baseContracts.TokenEmitter,
    manager: manager.toLowerCase(),
    managerRewardPoolFlowRatePercent,
    baselinePoolFlowRatePercent,
    challengePeriodEndsAt: 0,
    status: Status.Registered,
    flowId: "",
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
    db.insert(tokenEmitterToErc20).values({
      tokenEmitter: baseContracts.TokenEmitter,
      erc20: baseContracts.ERC20VotesMintable,
    }),
    db.insert(tcrToGrantId).values({
      tcr: baseContracts.FlowTCR,
      grantId,
    }),
    db.insert(rewardPoolContractToGrantId).values({
      contract: baseContracts.RewardPool,
      grantId,
    }),
    db.insert(arbitratorToGrantId).values({
      arbitrator: baseContracts.ERC20VotesArbitrator,
      grantId,
    }),
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
