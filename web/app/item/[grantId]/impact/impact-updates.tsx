"use client"

import { CastCard } from "@/components/ui/cast-card"
import { getCastsByIds } from "@/lib/database/queries/casts"
import { useServerFunction } from "@/lib/hooks/use-server-function"
import type { Impact } from "@prisma/flows"
import { useMemo } from "react"

interface Props {
  impact: Impact
}

export function ImpactUpdates({ impact }: Props) {
  const castIds = useMemo(() => {
    return impact.proofs
      .flatMap((proof) => proof.cast?.id)
      .filter((id) => id !== null && id !== undefined)
  }, [impact.proofs])

  const {
    data: casts = [],
    error,
    isLoading,
  } = useServerFunction(getCastsByIds, "casts", [castIds])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="space-y-4 md:p-4">
      {casts.map((cast) => (
        <CastCard key={cast.id.toString()} cast={cast} showVerification={false} />
      ))}
    </div>
  )
}
