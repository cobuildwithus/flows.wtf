"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePayRevnet } from "@/lib/revnet/hooks/use-pay-revnet"
import { useRevnetTokenPrice } from "@/lib/revnet/hooks/use-revnet-token-price"
import { base } from "viem/chains"
import { useAccount } from "wagmi"
import { useState, useMemo } from "react"
import { formatEther, parseEther } from "viem"

interface Props {
  projectId: bigint
}

export function BuyRevnetToken({ projectId }: Props) {
  const { address } = useAccount()
  const { payRevnet, isLoading } = usePayRevnet(base.id)
  const { data: priceData, isLoading: isPriceLoading } = useRevnetTokenPrice(projectId, base.id)
  const [payAmount, setPayAmount] = useState("0.01")

  const tokensToReceive = useMemo(() => {
    if (!priceData?.currentPrice || !payAmount) return "0"

    try {
      const payAmountWei = parseEther(payAmount)
      const currentPriceWei = BigInt(priceData.currentPrice)

      if (currentPriceWei === 0n) return "0"

      // Calculate tokens using BigInt arithmetic to avoid floating point issues
      // tokens = payAmount / pricePerToken = payAmountWei / (currentPriceWei / 1e18)
      // Simplified: tokens = (payAmountWei * 1e18) / currentPriceWei
      const tokens = (payAmountWei * BigInt(1e18)) / currentPriceWei
      const tokensFormatted = formatEther(tokens)

      // Round to 2 decimal places
      return Number.parseFloat(tokensFormatted).toFixed(2)
    } catch (error) {
      console.log("error", error)
      return "0"
    }
  }, [payAmount, priceData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) return

    await payRevnet(
      {
        projectId,
        token: "0x000000000000000000000000000000000000EEEe",
        amount: payAmount,
        beneficiary: address,
        memo: "Buying $BEANS tokens",
      },
      address,
    )
  }

  return (
    <form className="pointer-events-auto flex flex-col gap-3" onSubmit={handleSubmit}>
      <fieldset className="space-y-1">
        <Label htmlFor="pay" className="text-sm text-muted-foreground">
          Pay
        </Label>
        <div className="relative">
          <Input
            id="pay"
            className="h-11 pr-12 text-base"
            type="number"
            min={0.00001}
            step={0.00001}
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">ETH</span>
        </div>
      </fieldset>

      <fieldset className="space-y-1">
        <Label htmlFor="receive" className="text-sm text-muted-foreground">
          Receive
        </Label>
        <div className="relative">
          <Input
            id="receive"
            className="h-11 pr-16 text-base"
            type="number"
            value={isPriceLoading ? "..." : tokensToReceive}
            readOnly
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">$BEANS</span>
        </div>
      </fieldset>

      <Button variant="default" size="lg" type="submit" disabled={isLoading || !address}>
        {isLoading ? "Processing..." : "Buy $BEANS"}
      </Button>
    </form>
  )
}
