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
    try {
      setLoading(true)
      const response = await fetch("/api/grant-update", {
        method: "POST",
        body: JSON.stringify({ castHash, grantId }),
      })

      if (!response.ok) {
        if (response.status === 500) {
          throw new Error(
            (await response.text()) || "Internal server error. Please try again later.",
          )
        }
        throw new Error("Failed to check update")
      }

      const id = toast.info("Checking update (takes ~45 seconds)...", {
        duration: 50000,
      })
      // wait 50 seconds
      await new Promise((resolve) => setTimeout(resolve, 45000))
      toast.success("Verification successful", { id, duration: 2000 })
      router.refresh()
    } catch (error) {
      console.error("Failed to check update:", error)
      toast.error((error as Error).message || "Failed to check update")
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
