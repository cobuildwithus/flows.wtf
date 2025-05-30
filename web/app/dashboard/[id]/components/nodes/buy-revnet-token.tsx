"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePayRevnet } from "@/lib/revnet/hooks/use-pay-revnet"
import { useRevnetTokenPrice } from "@/lib/revnet/hooks/use-revnet-token-price"
import { useRevnetTokenDetails } from "@/lib/revnet/hooks/use-revnet-token-details"
import { base } from "viem/chains"
import { useAccount } from "wagmi"
import { useState } from "react"
import { AuthButton } from "@/components/ui/auth-button"

interface Props {
  projectId: bigint
}

export function BuyRevnetToken({ projectId }: Props) {
  const { address } = useAccount()
  const { payRevnet, isLoading } = usePayRevnet(base.id)
  const {
    isLoading: isPriceLoading,
    calculateTokensFromEth,
    calculateEthFromTokens,
  } = useRevnetTokenPrice(projectId, base.id)
  const { data: tokenDetails } = useRevnetTokenDetails(projectId, base.id)
  const [payAmount, setPayAmount] = useState("0.01")
  const [tokenAmount, setTokenAmount] = useState("")
  const [lastEdited, setLastEdited] = useState<"pay" | "token">("pay")

  const tokenSymbol = tokenDetails?.symbol || ""

  const handlePayAmountChange = (value: string) => {
    setPayAmount(value)
    setLastEdited("pay")
    if (value === "") {
      setTokenAmount("")
    } else {
      setTokenAmount(calculateTokensFromEth(value))
    }
  }

  const handleTokenAmountChange = (value: string) => {
    setTokenAmount(value)
    setLastEdited("token")
    if (value === "") {
      setPayAmount("")
    } else {
      setPayAmount(calculateEthFromTokens(value))
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
        memo: "",
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
            min={0.000001}
            step={0.00000000001}
            value={lastEdited === "pay" ? payAmount : calculateEthFromTokens(tokenAmount)}
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
            value={
              isPriceLoading
                ? ""
                : lastEdited === "token"
                  ? tokenAmount
                  : calculateTokensFromEth(payAmount)
            }
            onChange={(e) => handleTokenAmountChange(e.target.value)}
            readOnly={isPriceLoading}
            placeholder={isPriceLoading ? "Loading..." : "0"}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">{tokenSymbol}</span>
        </div>
      </fieldset>

      <AuthButton variant="default" size="lg" type="submit" disabled={isLoading || !payAmount}>
        {isLoading ? "Processing..." : `Buy`}
      </AuthButton>
    </form>
  )
}
