"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePayRevnet } from "@/lib/revnet/hooks/use-pay-revnet"
import { base } from "viem/chains"
import { useAccount } from "wagmi"
import { useState } from "react"

export function BuyRevnetToken(props: { projectId: bigint }) {
  const { address } = useAccount()
  const { payRevnet, isLoading } = usePayRevnet(base.id)
  const [payAmount, setPayAmount] = useState("0.01")

  const handleBuyTokens = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!address) return

    await payRevnet(
      {
        projectId: props.projectId,
        token: "0x000000000000000000000000000000000000EEEe", // ETH
        amount: payAmount,
        beneficiary: address,
        memo: "Buying $BEANS tokens",
      },
      address,
    )
  }

  return (
    <form className="pointer-events-auto flex flex-col gap-3" onSubmit={handleBuyTokens}>
      <fieldset className="space-y-1">
        <Label htmlFor="pay" className="text-sm text-muted-foreground">
          Pay
        </Label>

        <div className="relative flex items-center gap-2.5">
          <Input
            id="pay"
            className="h-11 text-base"
            type="number"
            min={0.00001}
            step={0.00001}
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
          />
          <span className="absolute right-3 text-sm">ETH</span>
        </div>
      </fieldset>
      <fieldset className="space-y-1">
        <Label htmlFor="receive" className="text-sm text-muted-foreground">
          Receive
        </Label>
        <div className="relative flex items-center gap-2.5">
          <Input
            id="receive"
            className="h-11 text-base"
            type="number"
            min={1}
            defaultValue={2000}
            readOnly
          />
          <span className="absolute right-3 text-sm">$BEANS</span>
        </div>
      </fieldset>
      <Button variant="default" size="lg" type="submit" disabled={isLoading || !address}>
        {isLoading ? "Processing..." : "Buy $BEANS"}
      </Button>
    </form>
  )
}
