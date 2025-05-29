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

interface Props {
  startupTitle: string
  projectId: bigint
  chainId: number
}

export function BringRevenueOnchain({ startupTitle, projectId, chainId }: Props) {
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { address } = useAccount()
  const { payRevnet, isLoading } = usePayRevnet(chainId, () => {
    // Reset form and close dialog on success
    setAmount("")
    setBeneficiary("")
    setMemo("")
    setIsOpen(false)
  })
  const { data: tokenDetails } = useRevnetTokenDetails(projectId, chainId)

  const [amount, setAmount] = useState("")
  const [beneficiary, setBeneficiary] = useState("")
  const [memo, setMemo] = useState("")
  const [beneficiaryError, setBeneficiaryError] = useState("")

  const tokenSymbol = tokenDetails?.symbol || ""

  const handleBeneficiaryChange = (value: string) => {
    setBeneficiary(value)
    if (value && !isAddress(value)) {
      setBeneficiaryError("Invalid Ethereum address")
    } else {
      setBeneficiaryError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address || !amount) return

    const recipient =
      beneficiary && isAddress(beneficiary) ? (beneficiary as `0x${string}`) : address

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
          <span className="text-xs font-bold">Add revenue +</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Bring revenue onchain</DialogTitle>
        </DialogHeader>

        <div className="mb-6 rounded-lg border bg-gradient-to-br from-muted/30 to-muted/60 p-5">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-green-500" />
            </div>
            <div className="space-y-3 text-sm">
              <p className="font-medium leading-relaxed">
                When you make sales offchain (Shopify, in-person etc), you can bring your revenue
                into the {startupTitle} revnet.
              </p>
              <div>
                <p className="mb-2 font-medium">This helps you:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                    <span>Track all revenue in one place</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                    <span>Issue ${tokenSymbol} tokens to yourself or your customers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                    <span>Maximize growth of the {startupTitle} network</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset className="space-y-2">
            <Label htmlFor="amount">Revenue Amount (ETH)</Label>
            <Input
              id="amount"
              type="number"
              min={0.00001}
              step={0.00001}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.1"
              required
            />
          </fieldset>

          <fieldset className="space-y-2">
            <Label htmlFor="beneficiary">
              Token Recipient <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="beneficiary"
              type="text"
              value={beneficiary}
              onChange={(e) => handleBeneficiaryChange(e.target.value)}
              placeholder={address || "0x..."}
            />
            {beneficiaryError && <p className="text-xs text-destructive">{beneficiaryError}</p>}
            <p className="text-xs text-muted-foreground">
              Your customer's wallet, or empty to issue tokens to yourself
            </p>
          </fieldset>

          <fieldset className="space-y-2">
            <Label htmlFor="memo">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="e.g., Sale of product X to customer Y"
              rows={2}
            />
          </fieldset>

          <AuthButton
            type="submit"
            disabled={isLoading || !amount || !!beneficiaryError}
            className="w-full"
          >
            {isLoading ? "Processing..." : "Bring revenue onchain"}
          </AuthButton>
        </form>

        <RevnetLinkBox startupTitle={startupTitle} projectId={projectId} chainId={chainId} />

        <Disclaimer startupTitle={startupTitle} />
      </DialogContent>
    </Dialog>
  )
}
