"use client"

import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { toast } from "sonner"

interface Props {
  flowContract: `0x${string}`
  opportunityId: string
  startupId: string
  position: string
}

export function CopyOpportunityLink(props: Props) {
  const { flowContract, opportunityId, startupId, position } = props

  function handleCopyLink() {
    const url = `${window.location.origin}/apply/${flowContract}?opportunityId=${opportunityId}&startupId=${startupId}&position=${position}`
    navigator.clipboard.writeText(url)
    toast.success("Copied application link")
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleCopyLink}>
      <Copy className="size-3.5" />
    </Button>
  )
}
