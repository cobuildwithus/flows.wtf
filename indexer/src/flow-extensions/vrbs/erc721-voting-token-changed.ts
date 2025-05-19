import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"

ponder.on("RevolutionFlow:ERC721VotingTokenChanged", handleVotingTokenChanged)
ponder.on("RevolutionFlowChildren:ERC721VotingTokenChanged", handleVotingTokenChanged)

async function handleVotingTokenChanged(params: {
  event: Event<"RevolutionFlow:ERC721VotingTokenChanged">
  context: Context<"RevolutionFlow:ERC721VotingTokenChanged">
}) {
  const { event, context } = params
  const { erc721Token } = event.args

  const grantId = event.log.address.toLowerCase()

  if (!grantId) {
    return
  }

  await context.db.update(grants, { id: grantId }).set({
    erc721VotingToken: erc721Token.toLowerCase(),
    votingTokenChainId: context.network.chainId,
  })
}
