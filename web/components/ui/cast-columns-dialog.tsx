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

interface CastColumnsDialogProps {
  trigger: React.ReactNode
  title?: string
  description?: string
  casts: MinimalCast[]
  showVerification?: boolean
}

export function CastColumnsDialog({
  trigger,
  title = "Activity",
  description,
  casts,
  showVerification,
}: CastColumnsDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="cursor-pointer">
        {trigger}
      </DialogTrigger>
      <DialogContent
        className={cn("overflow-y-auto", {
          "sm:max-w-2xl": casts.length === 1,
          "sm:max-w-5xl": casts.length === 2,
          "sm:max-w-7xl": casts.length >= 3,
        })}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <CastColumns
          emptyMessage="No casts yet"
          casts={casts}
          showVerification={showVerification}
        />
      </DialogContent>
    </Dialog>
  )
}
