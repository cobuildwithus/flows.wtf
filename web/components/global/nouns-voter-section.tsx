"use client"

import { MAX_VOTING_POWER, NOUNS_TOKEN } from "@/lib/config"
import { openseaNftUrl } from "@/lib/utils"
import Image from "next/image"
import { mainnet } from "viem/chains"
import { Alert, AlertDescription } from "../ui/alert"
import pluralize from "pluralize"

export function NounsVoter(props: { votingPower: bigint; tokenIds: bigint[] }) {
  const { votingPower, tokenIds } = props

  const tokensCount = tokenIds.length

  return (
    <>
      <div className="text-sm text-muted-foreground">
        Help flow money to builders by voting with your {pluralize("noun", tokensCount)}.
        <br />
        <div
          className="mt-4 columns-2 gap-3 space-y-3 sm:columns-3 md:columns-4 lg:columns-6"
          style={{ breakInside: "avoid" }}
        >
          {tokenIds.map((tokenId) => (
            <a
              key={tokenId.toString()}
              rel="noreferrer"
              target="_blank"
              className="group mb-3 flex break-inside-avoid flex-col items-center justify-center"
              href={openseaNftUrl(NOUNS_TOKEN, tokenId.toString(), mainnet.id)}
            >
              <Image
                src={`https://noun.pics/${tokenId.toString()}.png`}
                alt={`Noun ${tokenId}`}
                width={32}
                height={32}
                className="size-8 rounded-md border border-muted object-cover"
              />
              <span className="mt-1 text-xs text-muted-foreground">{tokenId.toString()}</span>
            </a>
          ))}
        </div>
        {votingPower > MAX_VOTING_POWER && (
          <Alert variant="destructive" className="mt-2.5">
            <AlertDescription className="text-xs">
              Voting power is calculated on mainnet, but we use Base. Due to current limitations,
              voting transactions fail when representing more than{" "}
              {Number(MAX_VOTING_POWER / BigInt(1000)).toString()} nouns. Therefore, you will be
              voting with a maximum of {MAX_VOTING_POWER.toString()} votes.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </>
  )
}
