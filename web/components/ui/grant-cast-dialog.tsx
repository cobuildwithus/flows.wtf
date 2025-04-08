"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MinimalCast } from "@/lib/types/cast"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { CastColumns } from "./cast-columns"

interface GrantCastDialogProps {
  trigger: React.ReactNode
  title?: string
  description?: string
  casts: MinimalCast[]
  showVerification?: boolean
}

export function GrantCastDialog({
  trigger,
  title = "Activity",
  description,
  casts,
  showVerification,
}: GrantCastDialogProps) {
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
        <CastColumns casts={casts} showVerification={showVerification} />
      </DialogContent>
    </Dialog>
  )
}
