import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"

ponder.on("VrbsFlow:ERC721VotingTokenChanged", handleVotingTokenChanged)
ponder.on("VrbsFlowChildren:ERC721VotingTokenChanged", handleVotingTokenChanged)

async function handleVotingTokenChanged(params: {
  event: Event<"VrbsFlow:ERC721VotingTokenChanged">
  context: Context<"VrbsFlow:ERC721VotingTokenChanged">
}) {
  const { event, context } = params
  const { erc721Token } = event.args

  const grantId = event.log.address.toLowerCase()

  if (!grantId) {
    return
  }

  await context.db.update(grants, { id: grantId }).set({
    erc721VotingToken: erc721Token.toLowerCase(),
    votingChainId: context.network.chainId,
  })
}
