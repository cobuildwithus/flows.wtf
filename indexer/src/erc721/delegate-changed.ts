import { Context, Event } from "ponder:registry"
import { ponder } from "ponder:registry"
import { erc721Tokens, tokenIdsByOwner } from "ponder:schema"
import { zeroAddress } from "viem"
import { getOwnerContractChainId, getTokenIdentifier } from "./721-utils"

ponder.on("ERC721TokenBase:DelegateChanged", handleDelegateChanged)
ponder.on("ERC721TokenMainnet:DelegateChanged", handleDelegateChanged)

async function handleDelegateChanged(params: {
  event: Event<"ERC721TokenBase:DelegateChanged"> | Event<"ERC721TokenMainnet:DelegateChanged">
  context:
    | Context<"ERC721TokenBase:DelegateChanged">
    | Context<"ERC721TokenMainnet:DelegateChanged">
}) {
  const { event, context } = params
  const delegator = event.args.delegator.toLowerCase()
  const newDelegate = (
    event.args.toDelegate === zeroAddress ? delegator : event.args.toDelegate
  ).toLowerCase()

  const delegatorTokenIds = await context.db.find(tokenIdsByOwner, {
    ownerContractChainId: getOwnerContractChainId(
      context.network.chainId,
      event.log.address.toLowerCase(),
      delegator
    ),
  })

  if (!delegatorTokenIds) return

  for (const tokenId of delegatorTokenIds.tokenIds) {
    await context.db
      .update(erc721Tokens, {
        id: getTokenIdentifier(context.network.chainId, event.log.address, tokenId),
      })
      .set({ delegate: newDelegate })
  }
}
