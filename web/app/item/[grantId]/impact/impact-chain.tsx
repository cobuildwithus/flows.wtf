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
import useWindowSize from "@/lib/hooks/use-window-size"
import { useQueryParams } from "@/lib/update-search-params"
import type { Impact } from "@prisma/flows"
import { DialogContent, DialogPortal } from "@radix-ui/react-dialog"
import { Cross2Icon } from "@radix-ui/react-icons"
import { ReactFlow } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import React, { useEffect, useMemo } from "react"
import { ImpactContent } from "./impact-content"
import { CustomBezierEdge } from "./nodes/custom-edge"
import { generateDiagram } from "./nodes/diagram-utils"
import { ImpactNode } from "./nodes/impact-node"
import { LaunchNode } from "./nodes/launch-node"

interface Props {
  impacts: Impact[]
  activatedAt: Date
  canEdit: boolean
  impactId?: string
  disableMetricsWarning?: boolean
}

export function ImpactChain(props: Props) {
  const { impacts, activatedAt, canEdit, impactId, disableMetricsWarning } = props
  const { width } = useWindowSize()
  const [api, setApi] = React.useState<CarouselApi>()
  const { updateQueryParam } = useQueryParams()
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)

  const isModalOpen = selectedIndex !== null

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

  const diagram = useMemo(() => {
    if (!width) return null

    return generateDiagram(
      [
        { type: "launch", width: 250, height: 240, data: { activatedAt } },
        ...impacts.map((impact, index) => ({
          type: "impact",
          width: 280,
          height: impact.name.length > 22 ? 300 : 240,
          data: {
            impact,
            disableMetricsWarning: disableMetricsWarning,
            onClick: () => {
              setSelectedIndex(index)
              updateQueryParam("impactId", impact.id)
            },
          },
        })),
      ],
      width,
    )
  }, [impacts, width, activatedAt, updateQueryParam])

  const closeDialog = () => {
    setSelectedIndex(null)
    updateQueryParam("impactId", null)
  }

  if (!diagram || !width) return null

  return (
    <>
      <div
        className="relative mx-auto w-full max-w-screen-2xl shrink-0"
        style={{ height: diagram.height }}
      >
        <ReactFlow
          nodes={diagram.nodes}
          edges={diagram.edges}
          minZoom={0.7}
          maxZoom={1}
          nodeTypes={{ impact: ImpactNode, launch: LaunchNode }}
          colorMode={"light"}
          nodesDraggable={false}
          elementsSelectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          panOnDrag={false}
          panOnScroll={false}
          proOptions={{ hideAttribution: true }}
          onlyRenderVisibleElements
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: "hsl(var(--primary) / 0.4)", strokeWidth: 2 },
          }}
          edgeTypes={{ "custom-bezier": CustomBezierEdge }}
          viewport={{ x: width > 768 ? 56 : 0, y: 0, zoom: 1 }}
        />
      </div>

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
    </>
  )
}
