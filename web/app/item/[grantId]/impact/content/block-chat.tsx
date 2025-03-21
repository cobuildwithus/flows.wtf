"use client"

import { Messages } from "@/app/chat/components/messages"
import { MultimodalInput } from "@/app/chat/components/multimodal-input"
import type { Impact } from "@prisma/flows"

interface Props {
  impact: Impact
}

export function BlockChat(props: Props) {
  return (
    <div className="absolute inset-0 z-10 flex min-w-0 flex-col bg-background/85 pt-5 backdrop-blur-xl">
      <Messages />

      <MultimodalInput className="p-2.5" autoFocus />
    </div>
  )
}
