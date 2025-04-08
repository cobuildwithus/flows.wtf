"use client"

import { useAgentChat } from "@/app/chat/components/agent-chat"
import { Button } from "@/components/ui/button"
import { GrantCastDialog } from "@/components/ui/grant-cast-dialog"
import { useLogin } from "@/lib/auth/use-login"
import type { User } from "@/lib/auth/user"
import type { MinimalCast } from "@/lib/types/cast"
import { MessageSquare } from "lucide-react"
import { Suspense, use } from "react"

interface Props {
  user?: User
  castsPromise: Promise<MinimalCast[]>
  grantId: string
  builderUsername: string
}

export function GrantFeedback(props: Props) {
  const { user, castsPromise, grantId, builderUsername } = props
  const { setIsOpen, setMessages, reload, setContext } = useAgentChat()
  const { login } = useLogin()

  return (
    <>
      <div className="flex h-full items-center justify-between space-x-4 rounded-xl border px-4 py-4 md:px-5">
        <div className="flex h-full flex-col justify-around">
          <div className="flex flex-col">
            <h5 className="text-sm font-medium">Feedback</h5>
            <h6 className="mt-px text-xs text-muted-foreground">Help improve this grant</h6>
          </div>

          <div className="mt-3 flex space-x-2.5">
            <Button
              variant="secondary"
              size="xs"
              onClick={() => {
                if (!user) return login()
                setContext(
                  `User just clicked "Leave Feedback" button on the grant page. 
                  Start collecting their feedback and put it in the cast preview tool.
                  Do not use other tools, just help them submit their feedback quickly via the cast preview tool.
                  For the cast preview tool, use the text of the feedback and the parent_url should be https://flows.wtf/item/${grantId}
                  In the post you create, the first thing in the message should be @${builderUsername}`,
                )
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
            </Button>
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
            <div className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-yellow-500 p-0.5 text-xs text-white">
              {casts.length}
            </div>
          )}
        </div>
      }
    />
  )
}
