"use client"

import { Input } from "@/components/ui/input"
import { usePayRevnet } from "@/lib/revnet/hooks/use-pay-revnet"
import { useRevnetTokenPrice } from "@/lib/revnet/hooks/use-revnet-token-price"
import { useRevnetTokenDetails } from "@/lib/revnet/hooks/use-revnet-token-details"
import { useAccount } from "wagmi"
import { useEffect, useState } from "react"
import { AuthButton } from "@/components/ui/auth-button"
import { ArrowDown } from "lucide-react"
import { TokenLogo } from "@/app/token/token-logo"
import { getRevnetTokenLogo } from "@/app/token/get-revnet-token-logo"
import { Startup } from "@/lib/onchain-startup/startup"

interface Props {
  startup: Startup
  revnetProjectId: number
}

export function BuyToken({ startup, revnetProjectId }: Props) {
  const { chainId, isBackedByFlows } = startup

  const { address } = useAccount()
  const { payRevnet, isLoading } = usePayRevnet(revnetProjectId, chainId)
  const {
    isLoading: isPriceLoading,
    calculateTokensFromEth,
    calculateEthFromTokens,
  } = useRevnetTokenPrice(revnetProjectId, chainId, isBackedByFlows)
  const { data: tokenDetails } = useRevnetTokenDetails(revnetProjectId, chainId)

  const [payAmount, setPayAmount] = useState("0.01")
  const [tokenAmount, setTokenAmount] = useState("")
  const [lastEdited, setLastEdited] = useState<"pay" | "token">("pay")
  const [touched, setTouched] = useState(false)

  const tokenSymbol = tokenDetails?.symbol || ""

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!touched) return
    }, 500)

    return () => clearTimeout(timer)
  }, [payAmount, touched])

  const handlePayAmountChange = (value: string) => {
    setTouched(true)
    setPayAmount(value)
    setLastEdited("pay")
    if (value === "") {
      setTokenAmount("")
    } else {
      setTokenAmount(calculateTokensFromEth(value))
    }
  }

  const handleTokenAmountChange = (value: string) => {
    setTouched(true)
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
        projectId: revnetProjectId,
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
        <div className="rounded-lg bg-accent/40 p-1.5 px-4 dark:bg-muted/30">
          {/* <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Pay</Label> */}
          <div className="flex items-center justify-between">
            <Input
              id="pay"
              onFocus={() => setTouched(true)}
              className="h-16 border-0 border-transparent bg-transparent p-0 text-3xl shadow-none focus-visible:ring-0"
              type="number"
              min={0.000001}
              step={0.00000000001}
              value={lastEdited === "pay" ? payAmount : calculateEthFromTokens(tokenAmount)}
              onChange={(e) => handlePayAmountChange(e.target.value)}
              placeholder="0"
            />
            <div className="ml-3 flex items-center rounded-full bg-background px-3 py-1.5">
              <div className="mr-2">
                <TokenLogo src="/eth.png" alt="ETH" />
              </div>
              <span className="text-base font-medium">ETH</span>
            </div>
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
        <div className="rounded-lg bg-accent/40 p-1.5 px-4 dark:bg-muted/30">
          {/* <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Receive</Label> */}
          <div className="flex items-center justify-between">
            <Input
              id="receive"
              className="h-16 border-0 border-transparent bg-transparent p-0 text-3xl shadow-none focus-visible:ring-0"
              type="number"
              min={0}
              step={0.01}
              onFocus={() => setTouched(true)}
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
            <div className="ml-3 flex items-center rounded-full bg-background px-3 py-1.5">
              <div className="mr-2">
                <TokenLogo src={getRevnetTokenLogo(tokenSymbol)} alt="TOKEN" />
              </div>
              <span className="text-base font-medium">{tokenSymbol || "TOKEN"}</span>
            </div>
          </div>
        </div>
      </div>

      <AuthButton
        variant="default"
        size="xl"
        type="submit"
        disabled={isLoading || !payAmount}
        className="w-full rounded-2xl text-base font-medium"
      >
        {isLoading ? "Processing..." : `Buy`}
      </AuthButton>
    </form>
  )
}
