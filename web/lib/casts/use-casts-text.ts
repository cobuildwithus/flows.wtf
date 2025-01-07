"use client"

import useSWR from "swr"
import { getCastsMentions } from "./get-casts-mentions"

interface UseCastsTextProps {
  text: string
  mentionsPositions: number[]
  mentionedFids: bigint[]
}

export function useCastsText({ text, mentionsPositions, mentionedFids }: UseCastsTextProps) {
  const {
    data: processedText,
    isLoading,
    error,
  } = useSWR(
    mentionedFids.length > 0 ? ["processed-text", text, mentionsPositions, mentionedFids] : null,
    () => getCastsMentions({ text, mentionsPositions, mentionedFids }),
  )

  return {
    text: processedText || text,
    isLoading,
    error,
  }
}
