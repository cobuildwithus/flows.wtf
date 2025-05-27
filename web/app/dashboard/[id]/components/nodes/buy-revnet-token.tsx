"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePayRevnet } from "@/lib/revnet/hooks/use-pay-revnet"
import { useRevnetTokenPrice } from "@/lib/revnet/hooks/use-revnet-token-price"
import { useRevnetTokenDetails } from "@/lib/revnet/hooks/use-revnet-token-details"
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
  const { data: tokenDetails } = useRevnetTokenDetails(projectId, base.id)
  const [payAmount, setPayAmount] = useState("0.01")
  const [tokenAmount, setTokenAmount] = useState("")
  const [lastEdited, setLastEdited] = useState<"pay" | "token">("pay")

  const tokenSymbol = tokenDetails?.symbol || ""

  // Calculate tokens when ETH amount changes
  const calculatedTokens = useMemo(() => {
    if (!priceData?.currentPrice || !payAmount || payAmount === "") return ""

    try {
      const payAmountWei = parseEther(payAmount)
      const currentPriceWei = BigInt(priceData.currentPrice)

      if (currentPriceWei === 0n) return "0"

      const tokens = (payAmountWei * BigInt(1e18)) / currentPriceWei
      const tokensFormatted = formatEther(tokens)

      // Remove trailing zeros
      const rounded = Number.parseFloat(tokensFormatted).toFixed(2)
      return Number.parseFloat(rounded).toString()
    } catch (error) {
      return ""
    }
  }, [payAmount, priceData])

  // Calculate ETH when token amount changes
  const calculatedEth = useMemo(() => {
    if (!priceData?.currentPrice || !tokenAmount || tokenAmount === "") return ""

    try {
      const tokenAmountWei = parseEther(tokenAmount)
      const currentPriceWei = BigInt(priceData.currentPrice)

      // ETH needed = tokens * pricePerToken
      const ethNeeded = (tokenAmountWei * currentPriceWei) / BigInt(1e18)
      const ethFormatted = formatEther(ethNeeded)

      // Remove trailing zeros
      const rounded = Number.parseFloat(ethFormatted).toFixed(6)
      return Number.parseFloat(rounded).toString()
    } catch (error) {
      return ""
    }
  }, [tokenAmount, priceData])

  const handlePayAmountChange = (value: string) => {
    setPayAmount(value)
    setLastEdited("pay")
    if (value === "") {
      setTokenAmount("")
    } else {
      setTokenAmount(calculatedTokens)
    }
  }

  const handleTokenAmountChange = (value: string) => {
    setTokenAmount(value)
    setLastEdited("token")
    if (value === "") {
      setPayAmount("")
    } else {
      setPayAmount(calculatedEth)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address || !payAmount) return

    await payRevnet(
      {
        projectId,
        token: "0x000000000000000000000000000000000000EEEe",
        amount: payAmount,
        beneficiary: address,
        memo: `Buying ${tokenSymbol} tokens`,
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
            value={lastEdited === "pay" ? payAmount : calculatedEth}
            onChange={(e) => handlePayAmountChange(e.target.value)}
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
            min={0}
            step={0.01}
            value={isPriceLoading ? "" : lastEdited === "token" ? tokenAmount : calculatedTokens}
            onChange={(e) => handleTokenAmountChange(e.target.value)}
            readOnly={isPriceLoading}
            placeholder={isPriceLoading ? "Loading..." : "0"}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">{tokenSymbol}</span>
        </div>
      </fieldset>

      <Button
        variant="default"
        size="lg"
        type="submit"
        disabled={isLoading || !address || !payAmount}
      >
        {isLoading ? "Processing..." : `Buy ${tokenSymbol}`}
      </Button>
    </form>
  )
}
