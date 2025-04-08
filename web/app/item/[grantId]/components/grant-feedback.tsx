"use client"

import { useAgentChat } from "@/app/chat/components/agent-chat"
import { Button } from "@/components/ui/button"
import { GrantCastDialog } from "@/components/ui/grant-cast-dialog"
import { useLogin } from "@/lib/auth/use-login"
import { User } from "@/lib/auth/user"
import { MinimalCast } from "@/lib/types/cast"
import { MessageSquare } from "lucide-react"
import { Suspense, use } from "react"

interface Props {
  user?: User
  castsPromise: Promise<MinimalCast[]>
}

export function GrantFeedback(props: Props) {
  const { user, castsPromise } = props
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
                  'User just clicked "Leave Feedback" button on the grant page. Start collecting the feedback process.',
                )
                setMessages([
                  {
                    role: "user",
                    content: "I want to leave feedback or ask builder a question on Farcaster",
                    id: "1",
                  },
                ])
                reload()
                setIsOpen(true)
              }}
            >
              Leave feedback
            </Button>
            <Suspense>
              <CastDialogWrapper castsPromise={castsPromise} />
            </Suspense>
          </div>
        </div>

        <div className="flex size-9 items-center justify-center rounded-full bg-primary p-2.5">
          <MessageSquare className="size-full text-primary-foreground" />
        </div>
      </div>
    </>
  )
}
function CastDialogWrapper({ castsPromise }: { castsPromise: Promise<MinimalCast[]> }) {
  const casts = use(castsPromise)

  if (casts.length === 0) return null

  return (
    <GrantCastDialog
      casts={casts}
      title="Grant Feedback"
      description="Questions and feedback posted by users on Farcaster"
      showVerification={false}
      trigger={
        <Button variant="ghost" size="xs">
          View
        </Button>
      }
    />
  )
}
