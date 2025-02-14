"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Impact } from "@prisma/flows"
import { Handle, Node, NodeProps, Position, useReactFlow } from "@xyflow/react"
import Image from "next/image"
import { memo } from "react"
import { ImpactContent } from "../impact-content"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export type IImpactNode = Node<
  {
    impact: Impact
    incomingPosition: Position | null
    outcomingPosition: Position | null
    layout: "vertical" | "horizontal"
    hasPrevious: boolean
    hasNext: boolean
    previousId?: string
    nextId?: string
  },
  "impact"
>

export function ImpactNode(props: NodeProps<IImpactNode>) {
  const { width = 100, height = 100, data } = props
  const {
    incomingPosition,
    outcomingPosition,
    impact,
    layout,
    hasPrevious,
    hasNext,
    previousId,
    nextId,
  } = data
  const { name, impactUnits, bestImage } = impact
  // const { setNodes } = useReactFlow()

  // const handlePrevious = () => {
  //   if (previousId) {
  //     setNodes((nodes) =>
  //       nodes.map((node) => ({
  //         ...node,
  //         selected: node.id === previousId,
  //       })),
  //     )
  //   }
  // }

  // const handleNext = () => {
  //   if (nextId) {
  //     setNodes((nodes) =>
  //       nodes.map((node) => ({
  //         ...node,
  //         selected: node.id === nextId,
  //       })),
  //     )
  //   }
  // }

  return (
    <Dialog>
      <DialogTrigger>
        <div
          className={cn(
            "group pointer-events-auto relative isolate flex cursor-pointer flex-col items-center gap-x-4 gap-y-4",
            {
              "flex-col": layout === "horizontal",
              "flex-row": layout === "vertical",
            },
          )}
          style={{ width, height, maxHeight: height }}
        >
          {bestImage?.url && (
            <div
              className={cn("rounded-xl", {
                "": layout === "horizontal",
                "h-full w-[50%] shrink-0 grow-0": layout === "vertical",
              })}
            >
              <Image
                src={bestImage.url}
                alt={name}
                width={bestImage.width}
                height={bestImage.height}
                className="rounded-xl object-cover transition-all duration-300 group-hover:scale-110"
              />
            </div>
          )}

          <div className="">
            <h2
              className={cn("mb-2 text-sm font-medium", { "text-center": layout === "horizontal" })}
            >
              {name}
            </h2>

            {impactUnits?.map((item) => (
              <div key={item.value + item.units} className="text-xs text-muted-foreground">
                {item.value} {item.units}
              </div>
            ))}
          </div>

          {incomingPosition && (
            <Handle
              type="target"
              position={incomingPosition}
              isConnectable={false}
              className={cn("!left-1/2 !right-1/2 !border-0 !bg-transparent", {
                // "!left-1/3": layout === "horizontal",
                // "!bottom-1/4 !left-1/4": layout === "vertical",
              })}
            />
          )}
          {outcomingPosition && (
            <Handle
              type="source"
              position={outcomingPosition}
              isConnectable={false}
              className={cn("!left-1/2 !right-1/2 !border-0 !bg-transparent", {
                // "!right-2/3": layout === "horizontal",
                // "!top-1/5 !right-2/3": layout === "vertical",
              })}
            />
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-5xl overflow-visible max-sm:px-0">
        <DialogHeader className="hidden max-sm:px-4">
          <DialogTitle className="flex items-center">{name}</DialogTitle>
        </DialogHeader>
        <ImpactContent
          impact={impact}
          // onPrevious={handlePrevious}
          // onNext={handleNext}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
        />
        <button
          disabled={!hasPrevious}
          className="pointer-events-auto absolute left-0 top-1/2 flex -translate-x-16 -translate-y-1/2 items-center justify-center rounded-full border bg-background p-2"
        >
          <ChevronLeft className="size-7" />
        </button>
        <button
          disabled={!hasNext}
          className="pointer-events-auto absolute right-0 top-1/2 flex -translate-y-1/2 translate-x-16 items-center justify-center rounded-full border bg-background p-2"
        >
          <ChevronRight className="size-7" />
        </button>
      </DialogContent>
    </Dialog>
  )
}

export default memo(ImpactNode)
