"use client"

import type { Cast } from "@prisma/farcaster"
import { CircleX } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "../button"
import { useRouter } from "next/navigation"

export const ZeroState = ({ cast }: { cast: Pick<Cast, "id"> }) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const checkUpdate = async () => {
    try {
      console.log("Checking update")
      setLoading(true)
      await fetch("/api/grant-update", {
        method: "POST",
        body: JSON.stringify({ castId: Number(cast.id) }),
      })
      const id = toast.info("Checking update (takes ~45 seconds)...", {
        duration: 50000,
      })
      // wait 50 seconds
      await new Promise((resolve) => setTimeout(resolve, 45000))
      toast.success("Verification successful", { id })
      router.refresh()
    } catch (error) {
      console.error("Failed to check update:", error)
      toast.error((error as Error).message || "Failed to check update")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-b-md border bg-muted/50 px-7 py-2">
      <CircleX className="size-4 text-gray-500/75" />
      <span className="text-xs font-medium text-muted-foreground">Not verified</span>
      <Button
        variant="outline"
        size="xs"
        loading={loading}
        className="ml-auto text-xs font-medium"
        onClick={checkUpdate}
      >
        Check
      </Button>
    </div>
  )
}
