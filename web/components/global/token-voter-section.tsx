"use client"

import { NOUNS_TOKEN } from "@/lib/config"
import pluralize from "pluralize"
import { base } from "@/addresses"

export function TokenVoter(props: { tokenContract: string; tokenIds: number[] }) {
  const { tokenContract, tokenIds } = props

  return (
    <>
      <div className="text-sm text-muted-foreground">
        Help flow money to builders by voting with your {tokenIds.length}{" "}
        {pluralize(ERC721Name({ tokenContract }), tokenIds.length)}.
      </div>
    </>
  )
}

export function ERC721Name(props: { tokenContract: string }) {
  const { tokenContract } = props

  if (tokenContract === NOUNS_TOKEN) {
    return "Noun"
  }
  if (tokenContract === base.VrbsToken) {
    return "Vrb"
  }
  if (tokenContract === base.GnarsToken) {
    return "Gnars"
  }
  if (tokenContract === base.GroundsToken) {
    return "Ground"
  }

  return tokenContract
}
