"use client"

import type { CastCard } from "@/components/ui/cast-card"
import { type ComponentProps, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { CastColumns } from "./cast-columns"

interface GrantCastDialogProps {
  trigger: React.ReactNode
  title?: string
  description?: string
  casts: ComponentProps<typeof CastCard>["cast"][]
}

export function GrantCastDialog({
  trigger,
  title = "Activity",
  description,
  casts,
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
        <CastColumns casts={casts} />
      </DialogContent>
    </Dialog>
  )
}
