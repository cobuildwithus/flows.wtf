"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { usePayRevnet } from "@/lib/revnet/hooks/use-pay-revnet"
import { useRevnetTokenDetails } from "@/lib/revnet/hooks/use-revnet-token-details"
import { useRevnetTokenPrice } from "@/lib/revnet/hooks/use-revnet-token-price"
import { Info } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAccount } from "wagmi"
import { AuthButton } from "@/components/ui/auth-button"
import { isAddress } from "viem"
import { Button } from "@/components/ui/button"
import { RevnetLinkBox } from "./revnet-link-box"
import { Disclaimer } from "./disclaimer"
import { EnsInput } from "@/components/ui/ens-input"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Startup } from "@/lib/onchain-startup/startup"

interface Props {
  startup: Startup
}

export function BringRevenueOnchain({ startup }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const { address } = useAccount()
  const { title: startupTitle, revnetProjectIds, chainId, isBackedByFlows } = startup
  const projectId = revnetProjectIds.base

  const { payRevnet, isLoading } = usePayRevnet(projectId, chainId, () => {
    // Reset form and close dialog on success
    setAmount("")
    setBeneficiary("")
    setResolvedAddress(null)
    setMemo("")
    setIsOpen(false)
  })
  const { data: tokenDetails } = useRevnetTokenDetails(projectId, chainId)
  const { isLoading: isPriceLoading, calculateTokensFromEth } = useRevnetTokenPrice(
    projectId,
    chainId,
    isBackedByFlows,
  )

  const [amount, setAmount] = useState("")
  const [beneficiary, setBeneficiary] = useState("")
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null)
  const [memo, setMemo] = useState("")

  const tokenSymbol = tokenDetails?.symbol || ""

  // Calculate tokens using the hook's helper function
  const calculatedTokens = calculateTokensFromEth(amount)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address || !amount) return

    // Use resolved address if available and beneficiary is not empty, otherwise use the input if it's a valid address
    const finalBeneficiary = beneficiary
      ? resolvedAddress || (isAddress(beneficiary) ? beneficiary : null)
      : null

    const recipient =
      finalBeneficiary && isAddress(finalBeneficiary)
        ? (finalBeneficiary as `0x${string}`)
        : address

    await payRevnet(
      {
        projectId,
        token: "0x000000000000000000000000000000000000EEEe",
        amount,
        beneficiary: recipient,
        memo: memo || `Revenue brought onchain for ${startupTitle}`,
      },
      address,
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="h-8 px-3 text-sm font-normal"
          aria-label="What does this mean?"
          tabIndex={0}
        >
          <span className="text-xs font-bold">Add +</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Bring revenue onchain</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left column - Form */}
          <div className="flex h-full">
            <form onSubmit={handleSubmit} className="flex w-full flex-col">
              <div className="flex-1 space-y-4">
                <fieldset className="space-y-2">
                  <Label htmlFor="amount">Revenue Amount (ETH)</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      min={0.00001}
                      step={0.00001}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.1"
                      className={cn(calculatedTokens && !isPriceLoading ? "pr-32" : "")}
                      required
                    />
                    {calculatedTokens && !isPriceLoading && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            <span className="text-xs text-muted-foreground">
                              {calculatedTokens} {tokenSymbol}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent align="end">
                          <p>How many tokens you earn</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {isPriceLoading && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                      </div>
                    )}
                  </div>
                </fieldset>

                <fieldset className="space-y-2">
                  <Label htmlFor="beneficiary">
                    Token Recipient <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <EnsInput
                    id="beneficiary"
                    value={beneficiary}
                    onChange={setBeneficiary}
                    onResolvedAddressChange={setResolvedAddress}
                    chainId={chainId}
                    helperText="Your customer's wallet (leave empty for your wallet)"
                  />
                </fieldset>

                <fieldset className="space-y-2">
                  <Label htmlFor="memo">
                    Description <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="memo"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder={`Revenue brought onchain for ${startupTitle}`}
                    rows={2}
                  />
                </fieldset>
              </div>

              <div className="mt-6">
                <AuthButton type="submit" disabled={isLoading || !amount} className="w-full py-5">
                  {isLoading ? "Processing..." : "Add revenue"}
                </AuthButton>
              </div>
            </form>
          </div>

          {/* Right column - Info */}
          <div className="space-y-4">
            <div className="rounded-lg border bg-gradient-to-br from-muted/30 to-muted/60 p-5">
              <div className="flex gap-4">
                <div className="flex-shrink-0 max-sm:hidden">
                  <Info className="h-5 w-5 text-green-500" />
                </div>
                <div className="space-y-3 text-sm">
                  <p className="font-medium leading-relaxed">
                    Sell offchain (Shopify, in-person etc) and bring your revenue into the{" "}
                    {startupTitle} revnet.
                  </p>
                  <div>
                    <p className="mb-2 font-medium">This helps you:</p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                        <span>Earn ${tokenSymbol} for yourself and your customers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                        <span>Maximize success of the {startupTitle} network</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <RevnetLinkBox startupTitle={startupTitle} projectId={projectId} chainId={chainId} />

            <Disclaimer startupTitle={startupTitle} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
