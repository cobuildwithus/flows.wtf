"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Draft } from "@prisma/flows"
import { useEffect, useState } from "react"
import { formatEther } from "viem"
import { useAccount } from "wagmi"

interface Props {
  draft: Draft
  cost: string
  symbol: string
}

export const CreatorCard = (props: Props) => {
  const { draft, cost, symbol } = props
  const [show, setShow] = useState(false)
  const { address } = useAccount()

  useEffect(() => {
    const isCreator =
      !!address && draft.users.some((user) => user.toLowerCase() === address.toLowerCase())
    setShow(isCreator)
  }, [address, draft.users])

  if (!show) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">Draft Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>
          The draft is publicly accessible. You can share it with others to get feedback or ask for
          sponsorship.
        </p>
        <p>
          Anyone can publish draft onchain by paying {formatEther(BigInt(cost))} ${symbol}. The
          application fee will be refunded if the draft is approved.
        </p>
      </CardContent>
    </Card>
  )
}
