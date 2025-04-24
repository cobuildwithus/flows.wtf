"use client"

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Dialog, DialogClose, DialogOverlay, DialogTitle } from "@/components/ui/dialog"
import { useQueryParams } from "@/lib/update-search-params"
import type { Impact } from "@prisma/flows"
import { DialogContent, DialogPortal } from "@radix-ui/react-dialog"
import { Cross2Icon } from "@radix-ui/react-icons"
import { useEffect, useState } from "react"
import { ImpactContent } from "./impact-content"

interface Props {
  impacts: (Impact & { grant?: { title: string } })[]
  impactId?: string
  canEdit: boolean
}

export function ImpactDialog(props: Props) {
  const { impacts, impactId, canEdit } = props
  const [api, setApi] = useState<CarouselApi>()
  const { updateQueryParam } = useQueryParams()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const isModalOpen = selectedIndex !== null

  const closeDialog = () => {
    setSelectedIndex(null)
    updateQueryParam("impactId", null)
  }

  useEffect(() => {
    if (!impactId) return
    const index = impacts.findIndex((impact) => impact.id === impactId)
    if (index !== -1) setSelectedIndex(index)
  }, [impactId])

  useEffect(() => {
    if (!isModalOpen || !api) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return

      if (e.key === "ArrowLeft") {
        api.scrollPrev()
      } else if (e.key === "ArrowRight") {
        api.scrollNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [api])

  useEffect(() => {
    if (!api) return

    const indexChanged = () => {
      const currentIndex = api.selectedScrollSnap()
      const currentImpactId = impacts[currentIndex]?.id
      if (currentImpactId && currentImpactId !== impactId) {
        updateQueryParam("impactId", currentImpactId)
      }
    }

    api.on("select", indexChanged)

    return () => {
      api.off("select", indexChanged)
    }
  }, [api])

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(open) => {
        if (!open) closeDialog()
      }}
    >
      <DialogPortal>
        <DialogTitle className="hidden">Impact Details</DialogTitle>
        <DialogOverlay />
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed inset-0 z-50 flex items-center justify-center duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 focus:outline-none"
          onClick={(e) => {
            if ((e.target as HTMLElement).hasAttribute("data-carousel-item")) {
              closeDialog()
            }
          }}
        >
          <Carousel
            setApi={setApi}
            className="w-full max-w-full"
            opts={{ startIndex: selectedIndex ?? 0 }}
          >
            {isModalOpen && (
              <>
                <CarouselContent>
                  {impacts.map((impact, index) => (
                    <CarouselItem key={impact.id}>
                      <div
                        onClick={() => closeDialog()}
                        className="mx-auto flex h-[100dvh] max-w-6xl flex-col items-center justify-center"
                      >
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="relative h-full w-full overflow-y-auto overflow-x-hidden bg-secondary scrollbar scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 md:h-auto md:max-h-[80vh] md:min-h-[560px] md:rounded-xl md:border"
                        >
                          {Math.abs(index - selectedIndex) <= 1 && (
                            <ImpactContent impact={impact} canEdit={canEdit} />
                          )}
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-8 z-50 size-10 max-sm:hidden" />
                <CarouselNext className="right-8 z-50 size-10 max-sm:hidden" />
              </>
            )}
          </Carousel>
          <DialogClose className="fixed right-4 top-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
            <Cross2Icon className="size-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
