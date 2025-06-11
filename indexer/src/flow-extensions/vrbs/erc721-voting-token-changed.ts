//todo add new voting token events

// import { ponder, type Context, type Event } from "ponder:registry"
// import { grants } from "ponder:schema"

// ponder.on("CustomFlow:ERC721VotingTokenChanged", handleVotingTokenChanged)

// async function handleVotingTokenChanged(params: {
//   event: Event<"CustomFlow:ERC721VotingTokenChanged">
//   context: Context<"CustomFlow:ERC721VotingTokenChanged">
// }) {
//   const { event, context } = params
//   const { erc721Token } = event.args

//   const grantId = event.log.address.toLowerCase()

//   if (!grantId) {
//     return
//   }

//   await context.db.update(grants, { id: grantId }).set({
//     erc721VotingToken: erc721Token.toLowerCase(),
//     votingTokenChainId: context.chain.id,
//   })
// }
