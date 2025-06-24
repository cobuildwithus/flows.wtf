"use client"

import { useRemoveRecipient } from "@/lib/onchain-startup/use-remove-recipient"
import { Button } from "../ui/button"
import { Trash } from "lucide-react"
import { getAddress } from "viem"

export const RemoveRecipientButton = ({
  contract,
  recipientId,
  chainId,
}: {
  contract: string
  recipientId: string
  chainId: number
}) => {
  const { removeRecipient } = useRemoveRecipient(chainId)

  const handleDelete = () => {
    removeRecipient({ recipientId, contract: getAddress(contract) })
  }

  return (
    <Button size="sm" variant="ghost" className="py-0.5" onClick={handleDelete}>
      <Trash className="size-3.5" />
    </Button>
  )
}
