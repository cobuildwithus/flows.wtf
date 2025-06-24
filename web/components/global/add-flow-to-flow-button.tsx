"use client"

import { Button } from "@/components/ui/button"
import { customFlowImplAbi } from "@/lib/abis"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import type { Draft } from "@prisma/flows"
import { toast } from "sonner"
import { encodeAbiParameters, keccak256, zeroAddress } from "viem"
import { useAccount } from "wagmi"
import { publishDraft } from "../../app/draft/[draftId]/publish-draft"
import { useRouter } from "next/navigation"

interface Props {
  draft: Draft
  contract: `0x${string}`
  chainId: number
  size?: "default" | "sm"
  onSuccess?: () => void
}

export function AddFlowToFlowButton(props: Props) {
  const { draft, contract, chainId, size = "default", onSuccess } = props
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
            functionName: "addFlowRecipient",
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
              {
                title: draft.title,
                description: draft.description,
                image: draft.image,
                tagline: draft.tagline || "",
                url: "",
              },
              getEthAddress(draft.users[0]), // flow's manager
              zeroAddress, // manager reward pool
              ["0xb9d3bcc9d5107ca0febd05123bd4b484e5163cfa"], // custom single allocator
            ],
          })
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : "An error occurred"
          toast.error(message, { id: toastId })
        }
      }}
    >
      {draft.opportunityId ? "Hire" : "Create flow"}
    </Button>
  )
}
