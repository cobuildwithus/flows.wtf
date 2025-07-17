"use client"

import { customFlowImplAbi } from "@/lib/abis"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { encodeAbiParameters, keccak256 } from "viem"
import { useAccount } from "wagmi"
import { Button } from "../ui/button"

export interface RecipientData {
  address: string
  title: string
  description: string
  image: string
  tagline: string
}

interface Props {
  recipient: RecipientData
  contract: `0x${string}`
  chainId: number
  size?: "default" | "sm" | "xl"
  onSuccess?: (hash: string) => void | Promise<void>
  disabled?: boolean
  buttonText?: string
}

export function AddRecipientToFlowButton(props: Props) {
  const {
    recipient,
    contract,
    chainId,
    size = "default",
    onSuccess,
    disabled,
    buttonText = "Add Recipient",
  } = props
  const { address } = useAccount()
  const router = useRouter()

  const { prepareWallet, writeContract, toastId, isLoading } = useContractTransaction({
    chainId,
    success: "Recipient added to flow!",
    onSuccess: async (hash) => {
      await onSuccess?.(hash)
      router.refresh()
    },
  })

  return (
    <Button
      disabled={isLoading || disabled}
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
                  [
                    recipient.title,
                    recipient.description,
                    recipient.image,
                    recipient.tagline || "",
                    "",
                  ],
                ),
              ),
              getEthAddress(recipient.address),
              {
                title: recipient.title,
                description: recipient.description,
                image: recipient.image,
                tagline: recipient.tagline || "",
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
      {buttonText}
    </Button>
  )
}
