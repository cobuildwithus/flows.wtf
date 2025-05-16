import { ponder, type Context, type Event } from "ponder:registry"
import { zeroAddress } from "viem"
import { erc721Tokens, tokenIdsByOwner } from "ponder:schema"
import { getOwnerContractChainId, getTokenIdentifier } from "./721-utils"

ponder.on("ERC721TokenBase:Transfer", handleTransfer)
ponder.on("ERC721TokenMainnet:Transfer", handleTransfer)

async function handleTransfer(params: {
  event: Event<"ERC721TokenMainnet:Transfer"> | Event<"ERC721TokenBase:Transfer">
  context: Context<"ERC721TokenMainnet:Transfer"> | Context<"ERC721TokenBase:Transfer">
}) {
  const { event, context } = params

  const { to, tokenId, from } = event.args
  const tokenContract = event.log.address.toLowerCase()
  const chainId = context.network.chainId
  const toAddress = to.toLowerCase()
  const fromAddress = from.toLowerCase()
  const id = getTokenIdentifier(chainId, tokenContract, Number(tokenId))

  const existingToken = await context.db.find(erc721Tokens, { id })
  if (!existingToken) {
    // Mint or transfer: upsert the token record
    await context.db.insert(erc721Tokens).values({
      id,
      contract: tokenContract,
      tokenId: Number(tokenId),
      owner: toAddress,
      burned: false,
      chainId,
      delegate: toAddress,
    })
  } else {
    // Update the token record
    await context.db.update(erc721Tokens, { id }).set({
      owner: toAddress,
      burned: false,
      delegate: toAddress,
    })
  }

  // Burn if sent to zero address
  if (toAddress === zeroAddress) {
    await context.db.update(erc721Tokens, { id }).set({
      owner: toAddress,
      burned: true,
      delegate: toAddress,
    })
  }

  await updateTokenIdMappings({
    db: context.db,
    chainId,
    tokenContract,
    tokenId,
    toAddress,
    fromAddress,
  })
}

async function updateTokenIdMappings(params: {
  db: Context["db"]
  chainId: number
  tokenContract: string
  tokenId: bigint
  toAddress: string
  fromAddress: string
}) {
  const { chainId, tokenContract, tokenId, toAddress, fromAddress, db } = params
  const existingOwnerId = getOwnerContractChainId(chainId, tokenContract, toAddress)
  const oldOwnerId = getOwnerContractChainId(chainId, tokenContract, fromAddress)

  let existingOwnerTokenIds = await db.find(tokenIdsByOwner, {
    ownerContractChainId: existingOwnerId,
  })
  let oldOwnerTokenIds = await db.find(tokenIdsByOwner, {
    ownerContractChainId: oldOwnerId,
  })

  if (!existingOwnerTokenIds) {
    existingOwnerTokenIds = await db.insert(tokenIdsByOwner).values({
      ownerContractChainId: existingOwnerId,
      tokenIds: [],
    })
  }

  if (!oldOwnerTokenIds) {
    oldOwnerTokenIds = await db.insert(tokenIdsByOwner).values({
      ownerContractChainId: oldOwnerId,
      tokenIds: [],
    })
  }

  // Add tokenId to new owner's tokenIds index
  await db
    .update(tokenIdsByOwner, {
      ownerContractChainId: existingOwnerId,
    })
    .set({
      tokenIds: [...existingOwnerTokenIds.tokenIds, Number(tokenId)],
    })

  // Remove tokenId from old owner's tokenIds index
  await db
    .update(tokenIdsByOwner, {
      ownerContractChainId: oldOwnerId,
    })
    .set({
      tokenIds: oldOwnerTokenIds.tokenIds.filter((id) => id !== Number(tokenId)),
    })
}
