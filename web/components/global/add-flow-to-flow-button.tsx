"use client"

import { Button } from "@/components/ui/button"
import { customFlowImplAbi } from "@/lib/abis"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { toast } from "sonner"
import { encodeAbiParameters, keccak256, zeroAddress } from "viem"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"

export interface FlowData {
  title: string
  description: string
  image: string
  tagline: string
  manager: string
}

interface Props {
  flow: FlowData
  contract: `0x${string}`
  chainId: number
  size?: "default" | "sm"
  onSuccess?: (hash: string) => void | Promise<void>
  buttonText?: string
}

export function AddFlowToFlowButton(props: Props) {
  const { flow, contract, chainId, size = "default", onSuccess, buttonText = "Create flow" } = props
  const { address } = useAccount()
  const router = useRouter()

  const { prepareWallet, writeContract, toastId, isLoading } = useContractTransaction({
    chainId,
    success: "Flow added successfully!",
    onSuccess: async (hash) => {
      await onSuccess?.(hash)
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
                  [flow.title, flow.description, flow.image, flow.tagline || "", ""],
                ),
              ),
              {
                title: flow.title,
                description: flow.description,
                image: flow.image,
                tagline: flow.tagline || "",
                url: "",
              },
              getEthAddress(flow.manager), // flow's manager
              "0xc4079dc1F8F84711eee0942c192829f473Fc3C28", //cobuild safe
              ["0x69a4212c9eec10b09d9635e224c626e81e50986b"], // custom single allocator TODO update before deploy
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
