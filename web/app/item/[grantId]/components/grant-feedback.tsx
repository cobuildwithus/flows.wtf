"use client"

import { useAgentChat } from "@/app/chat/components/agent-chat"
import { AuthButton } from "@/components/ui/auth-button"
import { GrantCastDialog } from "@/components/ui/grant-cast-dialog"
import type { User } from "@/lib/auth/user"
import type { MinimalCast } from "@/lib/types/cast"
import { MessageSquare } from "lucide-react"
import { Suspense, use } from "react"
import { flushSync } from "react-dom"

interface Props {
  user?: User
  castsPromise: Promise<MinimalCast[]>
  grantId: string
  builderUsername: string
}

export function GrantFeedback(props: Props) {
  const { castsPromise, grantId, builderUsername } = props
  const { setIsOpen, setContext, setMessages, reload } = useAgentChat()

  return (
    <>
      <div className="flex h-full items-center justify-between space-x-4 rounded-xl border px-4 py-4 md:px-5">
        <div className="flex h-full flex-col justify-around">
          <div className="flex flex-col">
            <h5 className="text-sm font-medium">Feedback</h5>
            <h6 className="mt-px text-xs text-muted-foreground">Help improve this grant</h6>
          </div>

          <div className="mt-3 flex space-x-2.5">
            <AuthButton
              variant="secondary"
              size="xs"
              onClick={() => {
                flushSync(() => {
                  setContext(
                    `User clicked the "Leave Feedback" button on the grant page.
                  
                  Begin collecting their feedback and prepare it for submission via the cast preview tool.
                  
                  Critical instructions:
                  - Do NOT provide ANY examples, suggestions, or ideas for feedback.
                  - Do NOT mention general categories or types of feedback.
                  - Simply ask: "What feedback would you like to leave for the builder?" and wait for their response.
                  - Any examples or suggestions, even general ones, violate this instruction.
                  - Do NOT use other tools; only assist the user in quickly submitting their feedback through the cast preview tool.
                  
                  When using the cast preview tool:
                  - Use the user's feedback text directly.
                  - Set the parent_url to: https://flows.wtf/item/${grantId}
                  - Begin the message with @${builderUsername}.`,
                  )
                })

                setMessages([
                  {
                    role: "user",
                    content: "I want to leave feedback or ask the builder a question please",
                    id: "1",
                  },
                ])

                reload()

                setIsOpen(true)
              }}
            >
              Leave feedback
            </AuthButton>
          </div>
        </div>

        <Suspense>
          <CastDialogWrapper castsPromise={castsPromise} />
        </Suspense>
      </div>
    </>
  )
}

function CastDialogWrapper({ castsPromise }: { castsPromise: Promise<MinimalCast[]> }) {
  const casts = use(castsPromise)

  return (
    <GrantCastDialog
      casts={casts}
      title="Grant Feedback"
      description="Questions and feedback posted by users on Farcaster"
      showVerification={false}
      trigger={
        <div className="relative flex size-9 items-center justify-center rounded-full bg-primary p-2.5">
          <MessageSquare className="size-full text-primary-foreground" />
          {casts.length > 0 && (
            <div className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-yellow-500 p-0.5 text-xs text-white dark:bg-yellow-600">
              {casts.length}
            </div>
          )}
        </div>
      }
    />
  )
}
