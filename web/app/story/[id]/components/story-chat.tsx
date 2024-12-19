"use client"

import { useAgentChat } from "@/app/chat/components/agent-chat"
import { Messages } from "@/app/chat/components/messages"
import { MultimodalInput } from "@/app/chat/components/multimodal-input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User } from "@/lib/auth/user"
import { canEditStory } from "@/lib/database/helpers"
import { Story } from "@prisma/flows"
import { RotateCcw } from "lucide-react"
import { useState } from "react"

interface Props {
  user?: User
  story: Story
}

export function StoryChat(props: Props) {
  const { user, story } = props
  const [isOpen, setIsOpen] = useState(false)
  const { messages, restart } = useAgentChat()

  const canEdit = canEditStory(story, user?.address)

  return (
    <>
      <div
        className="fixed bottom-4 left-0 right-0"
        onClick={(e) => {
          if (messages.length > 0 && !isOpen && user) {
            e.stopPropagation()
            setIsOpen(true)
          }
        }}
      >
        <MultimodalInput
          rows={1}
          className="rounded-xl border border-background md:max-w-2xl"
          placeholder={canEdit ? `Edit this story...` : `Ask about this story...`}
          onSubmit={() => {
            if (!isOpen) setIsOpen(true)
          }}
          autoFocus
        />
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-screen-md pb-0 max-sm:px-0">
          <DialogHeader className="max-sm:px-4">
            <DialogTitle className="flex items-center">
              Ask about {story.title}
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={restart}
                className="ml-2.5 text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="size-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex h-[calc(100dvh-100px)] min-w-0 flex-col">
            {user && messages.length > 0 && <Messages />}
            <MultimodalInput className="bg-background p-2" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
