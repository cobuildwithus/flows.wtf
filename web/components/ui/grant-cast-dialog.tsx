"use client"

import { CastCard } from "@/components/ui/cast-card"
import { ComponentProps, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

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
        <div
          className={cn("mt-4 grid auto-rows-max grid-cols-1 gap-4", {
            "sm:grid-cols-2": casts.length > 1 && casts.length < 3,
            "sm:grid-cols-3": casts.length >= 3,
          })}
        >
          {casts.length > 0 ? (
            casts.map((cast) => (
              <div key={cast.hash.toString()} className="break-inside-avoid">
                <CastCard cast={cast} />
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-sm text-muted-foreground">
              No activity found
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
