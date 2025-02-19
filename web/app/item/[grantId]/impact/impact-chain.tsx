"use client"

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Dialog, DialogClose, DialogOverlay, DialogTitle } from "@/components/ui/dialog"
import useWindowSize from "@/lib/hooks/use-window-size"
import { Impact } from "@prisma/flows"
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
}

export function ImpactChain(props: Props) {
  const { impacts, activatedAt } = props
  const { width } = useWindowSize()
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)
  const [api, setApi] = React.useState<CarouselApi>()

  useEffect(() => {
    if (selectedIndex === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        api?.scrollPrev()
      } else if (e.key === "ArrowRight") {
        api?.scrollNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [api, selectedIndex])

  const diagram = useMemo(() => {
    if (!width) return null

    return generateDiagram(
      [
        { type: "launch", width: 250, height: 240, data: { activatedAt } },
        ...impacts.map((impact, index) => ({
          type: "impact",
          width: 280,
          height: 240,
          data: { impact, onClick: () => setSelectedIndex(index) },
        })),
      ],
      width,
    )
  }, [width, impacts])

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
        ></ReactFlow>
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogPortal>
          <DialogTitle className="hidden">Impact Details</DialogTitle>
          <DialogOverlay />
          <DialogContent
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="fixed inset-0 z-50 flex items-center justify-center duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 focus:outline-none"
          >
            {selectedIndex !== null && (
              <Carousel setApi={setApi} className="w-full max-w-full">
                <CarouselContent>
                  {impacts.map((impact, index) => (
                    <CarouselItem key={index}>
                      <div className="mx-auto flex h-[100dvh] max-w-6xl items-center">
                        <div className="relative h-full w-full overflow-y-auto overflow-x-hidden bg-background scrollbar scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 md:h-[80vh] md:min-h-[620px] md:rounded-xl md:border">
                          <ImpactContent impact={impact} />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-8 z-50 size-10 max-sm:hidden" />
                <CarouselNext className="right-8 z-50 size-10 max-sm:hidden" />
              </Carousel>
            )}
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
