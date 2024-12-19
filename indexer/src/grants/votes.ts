import { ponder, type Context, type Event } from "ponder:registry"
import { getMonthlyIncomingFlowRate } from "./lib/monthly-flow"
import { handleIncomingFlowRates } from "./lib/handle-incoming-flow-rates"
import { votes, grants, votesByTokenIdAndContract } from "ponder:schema"
import { eq, not } from "ponder"
import { and } from "ponder"

ponder.on("NounsFlow:VoteCast", handleVoteCast)
ponder.on("NounsFlowChildren:VoteCast", handleVoteCast)

async function handleVoteCast(params: {
  event: Event<"NounsFlow:VoteCast">
  context: Context<"NounsFlow:VoteCast">
}) {
  const { event, context } = params
  const { recipientId, tokenId, bps, totalWeight } = event.args

  const blockNumber = event.block.number.toString()
  const blockTimestamp = Number(event.block.timestamp)
  const transactionHash = event.transaction.hash
  const voter = event.transaction.from.toLowerCase()
  const contract = event.log.address.toLowerCase() as `0x${string}`
  const votesCount = bps / (totalWeight / BigInt(1e18))

  const affectedGrantsIds = new Map<string, bigint>()
  affectedGrantsIds.set(recipientId.toString(), votesCount)

  let hasPreviousVotes = false

  // Mark old votes for this token as stale
  const oldVotes = await getOldVotes(context.db, contract, tokenId, blockNumber)

  oldVotes.forEach((oldVote) => {
    const existingVotes = affectedGrantsIds.get(oldVote.recipientId) ?? BigInt(0)
    affectedGrantsIds.set(oldVote.recipientId, existingVotes - BigInt(oldVote.votesCount))
    hasPreviousVotes = true
  })

  const voteId = `${contract}_${recipientId}_${voter}_${blockNumber}_${tokenId}`

  // Create the new vote
  await context.db.insert(votes).values({
    id: voteId,
    contract,
    recipientId: recipientId.toString(),
    tokenId: tokenId.toString(),
    bps: Number(bps),
    voter,
    blockNumber,
    blockTimestamp,
    transactionHash,
    votesCount: votesCount.toString(),
  })

  await context.db
    .insert(votesByTokenIdAndContract)
    .values({
      contractTokenId: `${contract}_${tokenId}`,
      voteIds: [voteId],
    })
    .onConflictDoUpdate((row) => ({
      voteIds: Array.from(new Set([...row.voteIds, voteId])),
    }))

  for (const [affectedGrantId, votesDelta] of affectedGrantsIds) {
    const monthlyIncomingFlowRate = await getGrantBudget(
      context as Context,
      contract,
      affectedGrantId
    )

    await context.db.update(grants, { id: affectedGrantId }).set((row) => ({
      votesCount: (BigInt(row.votesCount) + votesDelta).toString(),
      monthlyIncomingFlowRate,
    }))
  }

  // if is a new voter, then we are adding new member units to the total
  // so must handle all sibling flow rates
  if (!hasPreviousVotes) {
    await handleIncomingFlowRates(context.db, contract)
  }
}

async function getGrantBudget(context: Context, parentContract: `0x${string}`, id: string) {
  const grant = await context.db.find(grants, { id })

  if (!grant) throw new Error(`Could not find grant ${id}`)

  return getMonthlyIncomingFlowRate(context, parentContract, grant.recipient)
}

async function getOldVotes(
  db: Context["db"],
  contract: `0x${string}`,
  tokenId: bigint,
  blockNumber: string
) {
  const existingVoteIds = await db.find(votesByTokenIdAndContract, {
    contractTokenId: `${contract}_${tokenId}`,
  })

  if (!existingVoteIds) return []

  const existingVotesRaw = await Promise.all(
    existingVoteIds.voteIds.map((voteId) => db.find(votes, { id: voteId }))
  )

  // filter out nulls
  const existingVotesNotNull = existingVotesRaw.filter(
    (vote) => vote !== undefined && vote !== null
  )

  // include votes that come before the latest vote block number
  // since all votescast events happen in the same block per vote
  const oldVotes = existingVotesNotNull.filter((vote) => vote.blockNumber !== blockNumber)

  // delete all old votes
  await Promise.all(oldVotes.map((vote) => db.delete(votes, { id: vote.id })))

  await db
    .update(votesByTokenIdAndContract, { contractTokenId: `${contract}_${tokenId}` })
    .set((row) => ({
      voteIds: row.voteIds.filter((voteId) => !oldVotes.some((oldVote) => oldVote.id === voteId)),
    }))

  return oldVotes
}
