"use client"

import { useAgentChat } from "@/app/chat/components/agent-chat"
import { Button } from "@/components/ui/button"
import { CastCard } from "@/components/ui/cast-card"
import { getCastsByIds } from "@/lib/database/queries/casts"
import { useServerFunction } from "@/lib/hooks/use-server-function"
import { cn } from "@/lib/utils"
import type { Impact } from "@prisma/flows"
import { useMemo } from "react"

interface Props {
  proofs: Impact["proofs"]
  impactId: string
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  canEdit: boolean
}

export function BlockCasts({ proofs, impactId, isEditing, setIsEditing, canEdit }: Props) {
  const { setMessages, reload, appendData } = useAgentChat()

  const castIds = useMemo(() => {
    return proofs.flatMap((proof) => proof.cast?.id).filter((id) => id !== null && id !== undefined)
  }, [proofs])

  const {
    data: casts = [],
    error,
    isLoading,
  } = useServerFunction(getCastsByIds, "casts", [castIds])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
        Loading updates...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Oops! Something went wrong: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-4 md:p-4">
      {canEdit && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Add pictures or videos as proof of your impact.
          </p>

          <Button
            variant={isEditing ? "outline" : "default"}
            className={cn("mt-4 rounded-2xl", { "bg-transparent": isEditing })}
            onClick={() => {
              setIsEditing(true)
              appendData({
                impactId,
              })
              setMessages([
                {
                  role: "user",
                  content: "I want to add pictures or videos as proof of my impact",
                  id: "1",
                },
              ])
              reload()
            }}
          >
            Add media
          </Button>
        </div>
      )}
      {casts.map((cast) => (
        <CastCard key={cast.id.toString()} cast={cast} showVerification={false} />
      ))}
    </div>
  )
}
