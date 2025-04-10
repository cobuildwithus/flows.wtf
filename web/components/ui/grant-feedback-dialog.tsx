"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { MinimalCast } from "@/lib/types/cast"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { CastColumns } from "./cast-columns"
import { LeaveFeedbackButton } from "@/app/item/[grantId]/components/leave-feedback-button"
import { Button } from "./button"

interface GrantFeedbackDialogProps {
  trigger: React.ReactNode
  title?: string
  description?: string
  casts: MinimalCast[]
  grantId: string
  builderUsername: string
  showVerification?: boolean
}

export function GrantFeedbackDialog({
  trigger,
  title = "Feedback",
  description,
  casts,
  grantId,
  builderUsername,
  showVerification,
}: GrantFeedbackDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="cursor-pointer">
        {trigger}
      </DialogTrigger>
      <DialogContent
        className={cn("overflow-y-auto [&>button]:hidden", {
          "sm:max-w-2xl": casts.length === 1,
          "sm:max-w-5xl": casts.length === 2,
          "sm:max-w-7xl": casts.length >= 3,
        })}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-4 text-xl">
            {title}
            <LeaveFeedbackButton
              variant="default"
              text="Post new"
              grantId={grantId}
              builderUsername={builderUsername}
            />
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <CastColumns
          emptyMessage="No feedback yet"
          casts={casts}
          showVerification={showVerification}
        />
        <DialogFooter>
          <DialogClose>
            <Button variant="ghost" size="sm" className="mt-6" tabIndex={-1}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
