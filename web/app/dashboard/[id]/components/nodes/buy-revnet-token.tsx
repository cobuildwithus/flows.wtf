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
import { ArrowDown } from "lucide-react"

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
    <form className="pointer-events-auto space-y-1 rounded-xl py-1.5" onSubmit={handleSubmit}>
      <div className="relative flex flex-col">
        {/* Pay section */}
        <div className="rounded-lg bg-muted/30 p-1.5 px-4">
          {/* <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Pay</Label> */}
          <div className="flex items-center justify-between">
            <Input
              id="pay"
              className="h-12 border-0 border-transparent bg-transparent p-0 text-xl shadow-none focus-visible:ring-0"
              type="number"
              min={0.000001}
              step={0.00000000001}
              value={lastEdited === "pay" ? payAmount : calculateEthFromTokens(tokenAmount)}
              onChange={(e) => handlePayAmountChange(e.target.value)}
              placeholder="0"
            />
            <span className="ml-3 rounded-md bg-background px-3 py-1.5 text-sm font-medium">
              ETH
            </span>
          </div>
        </div>

        {/* Arrow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-background bg-muted/80">
            <ArrowDown className="h-4 w-4" />
          </div>
        </div>

        <div className="mb-1" />

        {/* Receive section */}
        <div className="rounded-lg bg-muted/30 p-1.5 px-4">
          {/* <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Receive</Label> */}
          <div className="flex items-center justify-between">
            <Input
              id="receive"
              className="h-12 border-0 border-transparent bg-transparent p-0 text-xl shadow-none focus-visible:ring-0"
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
              placeholder={isPriceLoading ? "..." : "0"}
            />
            <span className="ml-3 rounded-md bg-background px-3 py-1.5 text-sm font-medium">
              {tokenSymbol || "TOKEN"}
            </span>
          </div>
        </div>
      </div>

      <AuthButton
        variant="default"
        size="lg"
        type="submit"
        disabled={isLoading || !payAmount}
        className="w-full rounded-lg text-base font-medium"
      >
        {isLoading ? "Processing..." : `Buy`}
      </AuthButton>
    </form>
  )
}
