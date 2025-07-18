"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAccount } from "wagmi"
import { useBalance } from "wagmi"
import { formatEther } from "viem"
import { usePayRevnet } from "@/lib/revnet/hooks/use-pay-revnet"
import { useRevnetTokenPrice } from "@/lib/revnet/hooks/use-revnet-token-price"
import { useRevnetTokenDetails } from "@/lib/revnet/hooks/use-revnet-token-details"
import type { StartupWithRevenue } from "./types"
import { TokenLogo } from "@/app/token/token-logo"
import { getRevnetTokenLogo } from "@/app/token/get-revnet-token-logo"
import { cn } from "@/lib/utils"

interface Props {
  startup: StartupWithRevenue
}

const TIERS = ["0.001", "0.01", "0.1"] // ETH values as strings

function TierButton({
  value,
  selected,
  onClick,
}: {
  value: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-md border px-3 py-2 text-sm font-medium transition-colors",
        selected ? "border-primary bg-primary/10" : "hover:bg-muted",
      )}
    >
      {value}
    </button>
  )
}

export function BuyRevnetDialog({ startup }: Props) {
  const { address } = useAccount()
  const { data: ethBalance } = useBalance({ address, chainId: startup.chainId })
  const maxEth = ethBalance ? formatEther(ethBalance.value) : "0"
  const [open, setOpen] = useState(false)
  const [payAmount, setPayAmount] = useState<string>(TIERS[0]) // default tier
  const [custom, setCustom] = useState<string>("")

  const { payRevnet, isLoading } = usePayRevnet(startup.projectIdBase, startup.chainId)
  const { isLoading: isPriceLoading, calculateTokensFromEth } = useRevnetTokenPrice(
    startup.projectIdBase,
    startup.chainId,
    startup.isBackedByFlows,
  )
  const { data: tokenDetails } = useRevnetTokenDetails(startup.projectIdBase, startup.chainId)
  const tokenSymbol = tokenDetails?.symbol || "TOKEN"

  const selectedAmount = custom !== "" ? custom : payAmount
  const tokenAmount = isPriceLoading ? "" : calculateTokensFromEth(selectedAmount)

  const handleBuy = async () => {
    if (!address || !selectedAmount) return
    await payRevnet(
      {
        projectId: startup.projectIdBase,
        token: "0x000000000000000000000000000000000000EEEe",
        amount: selectedAmount,
        beneficiary: address,
        memo: "",
      },
      address,
    )
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="w-full hover:bg-muted">
          Buy
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-center">Buy {startup.title} Token</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Pay input and tier buttons grouped closer */}
          <div className="space-y-3">
            {/* Pay input */}
            <div className="rounded-lg bg-muted/40 p-3">
              <div className="flex items-center justify-between gap-3">
                <Input
                  type="number"
                  autoFocus
                  min={0.000001}
                  step={0.00000001}
                  value={selectedAmount}
                  onChange={(e) => {
                    const val = e.target.value
                    setCustom(val)
                    if (val === "") {
                      setPayAmount("")
                    }
                  }}
                  placeholder="0"
                  className="h-12 flex-1 border-none bg-transparent p-0 text-3xl font-semibold shadow-none focus-visible:ring-0"
                />
                <div className="flex items-center space-x-2 rounded-full bg-background px-3 py-2 text-sm font-medium">
                  <TokenLogo src="/eth.png" alt="ETH" />
                  <span>ETH</span>
                </div>
              </div>
            </div>

            {/* Tier buttons */}
            <div className="grid grid-cols-4 gap-3">
              {TIERS.map((tier) => (
                <TierButton
                  key={tier}
                  value={`${tier} ETH`}
                  selected={selectedAmount === tier && custom === ""}
                  onClick={() => {
                    setCustom("")
                    setPayAmount(tier)
                  }}
                />
              ))}
              {/* Max button */}
              <button
                type="button"
                onClick={() => {
                  if (!address || maxEth === "0") return
                  const rounded = Number(maxEth)
                    .toFixed(6)
                    .replace(/\.0+$|(?<=\d)0+$/g, "")
                  setCustom(rounded)
                  setPayAmount("")
                }}
                className="rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                Max
              </button>
            </div>
          </div>

          {/* Preview */}
          {!isPriceLoading && (
            <div className="flex items-center justify-between rounded-md bg-accent/20 p-3 text-sm">
              <span>
                You receive <strong>{tokenAmount}</strong> {tokenSymbol}
              </span>
              <TokenLogo src={getRevnetTokenLogo(tokenSymbol)} alt={tokenSymbol} />
            </div>
          )}

          {/* Buy button */}
          <Button
            variant="default"
            size="xl"
            className="w-full rounded-2xl text-base font-medium"
            disabled={isLoading || !selectedAmount}
            onClick={handleBuy}
          >
            {isLoading ? "Processing..." : `Buy`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
