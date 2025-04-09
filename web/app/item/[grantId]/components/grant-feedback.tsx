"use client"

import { GrantCastDialog } from "@/components/ui/grant-cast-dialog"
import type { User } from "@/lib/auth/user"
import type { MinimalCast } from "@/lib/types/cast"
import { MessageSquare } from "lucide-react"
import { Suspense, use } from "react"
import { LeaveFeedbackButton } from "./leave-feedback-button"

interface Props {
  user?: User
  castsPromise: Promise<MinimalCast[]>
  grantId: string
  builderUsername: string
}

export function GrantFeedback(props: Props) {
  const { castsPromise, grantId, builderUsername } = props

  return (
    <>
      <div className="flex h-full items-center justify-between space-x-4 rounded-xl border px-4 py-4 md:px-5">
        <div className="flex h-full flex-col justify-around">
          <div className="flex flex-col">
            <h5 className="text-sm font-medium">Feedback</h5>
            <h6 className="mt-px text-xs text-muted-foreground">Help the builder improve</h6>
          </div>

          <div className="mt-3 flex space-x-2.5">
            <LeaveFeedbackButton grantId={grantId} builderUsername={builderUsername} />
          </div>
        </div>

        <Suspense>
          <CastDialogWrapper
            castsPromise={castsPromise}
            grantId={grantId}
            builderUsername={builderUsername}
          />
        </Suspense>
      </div>
    </>
  )
}

function CastDialogWrapper({
  castsPromise,
  grantId,
  builderUsername,
}: {
  castsPromise: Promise<MinimalCast[]>
  grantId: string
  builderUsername: string
}) {
  const casts = use(castsPromise)

  return (
    <GrantCastDialog
      casts={casts}
      title="Feedback"
      description="Questions for the builder"
      showVerification={false}
      grantId={grantId}
      builderUsername={builderUsername}
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
