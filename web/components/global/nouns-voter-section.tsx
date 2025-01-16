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
        <div className="mt-4 grid grid-cols-2 gap-4">
          {tokenIds.map((tokenId) => (
            <div key={tokenId} className="flex">
              <a
                target="_blank"
                className="group flex items-center"
                href={openseaNftUrl(NOUNS_TOKEN, tokenId.toString(), mainnet.id)}
              >
                <Image
                  src={`https://noun.pics/${tokenId.toString()}.png`}
                  alt={`Noun ${tokenId}`}
                  width={24}
                  height={24}
                  className="size-8 rounded-md object-cover"
                />
              </a>
            </div>
          ))}
        </div>
        {votingPower > MAX_VOTING_POWER && (
          <Alert variant="destructive" className="mt-2.5">
            <AlertDescription className="text-xs">
              Voting power is calculated on the mainnet, but we use Base. Due to current
              limitations, voting transactions fail when representing more than 6 nouns. Therefore,
              you will be voting with a maximum of {MAX_VOTING_POWER.toString()} votes.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </>
  )
}
