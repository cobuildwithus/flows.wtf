"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "../button"
import { useRouter } from "next/navigation"

export const CheckUpdateButton = ({
  castHash,
  grantId,
  text = "Check",
}: {
  castHash: string
  grantId: string
  text?: string
}) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const checkUpdate = async () => {
    const toastId = toast.loading("Checking cast…")
    try {
      setLoading(true)
      const response = await fetch("/api/grant-update", {
        method: "POST",
        body: JSON.stringify({ castHash, grantId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to check update")
      }

      if (result.rulePassed) {
        toast.success("Verified as grant update!", { id: toastId })
      } else {
        toast.error(result.outcomeReason || "Not verified as grant update", { id: toastId })
      }
      router.refresh()
    } catch (error) {
      console.error("Failed to check update:", error)
      toast.error((error as Error).message || "Failed to check update", { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="xs"
      loading={loading}
      disabled={loading}
      className="ml-auto text-xs font-medium"
      onClick={checkUpdate}
    >
      {loading ? "Checking..." : text}
    </Button>
  )
}
