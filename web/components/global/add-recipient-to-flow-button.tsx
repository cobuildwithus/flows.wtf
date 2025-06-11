"use client"

import { Button } from "@/components/ui/button"
import { customFlowImplAbi } from "@/lib/abis"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import type { Draft } from "@prisma/flows"
import { toast } from "sonner"
import { encodeAbiParameters, keccak256 } from "viem"
import { base } from "viem/chains"
import { useAccount } from "wagmi"
import { publishDraft } from "../../app/draft/[draftId]/publish-draft"
import { useRouter } from "next/navigation"

interface Props {
  draft: Draft
  contract: `0x${string}`
  size?: "default" | "sm"
  onSuccess?: () => void
}

const chainId = base.id

export function AddRecipientToFlowButton(props: Props) {
  const { draft, contract, size = "default", onSuccess } = props
  const { address } = useAccount()
  const router = useRouter()

  const { prepareWallet, writeContract, toastId, isLoading } = useContractTransaction({
    chainId,
    success: "Recipient added to flow!",
    onSuccess: async (hash) => {
      await publishDraft(draft.id, hash)
      onSuccess?.()
      router.refresh()
    },
  })

  return (
    <Button
      disabled={isLoading}
      loading={isLoading}
      size={size}
      type="button"
      onClick={async () => {
        try {
          await prepareWallet()

          writeContract({
            account: address,
            abi: customFlowImplAbi,
            functionName: "addRecipient",
            address: contract,
            chainId,
            args: [
              keccak256(
                encodeAbiParameters(
                  [
                    { name: "title", type: "string" },
                    { name: "description", type: "string" },
                    { name: "image", type: "string" },
                    { name: "tagline", type: "string" },
                    { name: "url", type: "string" },
                  ],
                  [draft.title, draft.description, draft.image, draft.tagline || "", ""],
                ),
              ),
              getEthAddress(draft.users[0]),
              {
                title: draft.title,
                description: draft.description,
                image: draft.image,
                tagline: draft.tagline || "",
                url: "",
              },
            ],
          })
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : "An error occurred"
          toast.error(message, { id: toastId })
        }
      }}
    >
      {draft.opportunityId ? "Hire" : "Add to flow"}
    </Button>
  )
}
