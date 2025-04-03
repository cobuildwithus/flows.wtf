"use client"

import { Badge } from "@/components/ui/badge"
import { DateTime } from "@/components/ui/date-time"
import { Impact } from "@prisma/flows"
import { Handle, Node, NodeProps, Position } from "@xyflow/react"
import Image from "next/image"
import { memo } from "react"

export type IImpactNode = Node<
  {
    impact: Impact
    incomingPosition: Position | null
    outcomingPosition: Position | null
    onClick: () => void
  },
  "impact"
>

export function ImpactNode(props: NodeProps<IImpactNode>) {
  const { width = 320, height = 320, data } = props
  const { incomingPosition, outcomingPosition, impact, onClick } = data
  const { name, bestImage } = impact

  const imageUrl = bestImage.urlFromBuilder ?? bestImage.url

  const hasMetrics = impact.impactMetrics.some((m) => Number(m.value) > 0)

  return (
    <div
      className="group pointer-events-auto relative isolate flex cursor-pointer flex-col items-center"
      style={{ width, height, maxHeight: height }}
      onClick={onClick}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={name}
          width={width}
          height={height}
          className="pointer-events-none aspect-video rounded-xl object-cover transition-all duration-300 md:group-hover:scale-110"
        />
      )}

      <div className="mt-5">
        <h2 className="text-center text-[15px] font-medium">{name}</h2>
        <div className="mt-2 text-center text-xs text-muted-foreground">
          <DateTime date={impact.date} shortDate />
        </div>
      </div>

      {!hasMetrics && (
        <Badge
          variant="destructive"
          className="absolute right-1.5 top-1.5 text-xs hover:bg-destructive"
        >
          Missing metrics
        </Badge>
      )}

      {incomingPosition && (
        <Handle
          type="target"
          position={incomingPosition}
          isConnectable={false}
          className="!left-1/2 !right-1/2 !border-0 !bg-transparent"
        />
      )}
      {outcomingPosition && (
        <Handle
          type="source"
          position={outcomingPosition}
          isConnectable={false}
          className="!left-1/2 !right-1/2 !border-0 !bg-transparent"
        />
      )}
    </div>
  )
}

export default memo(ImpactNode)
