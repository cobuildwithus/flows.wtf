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
  const { width = 100, height = 100, data } = props
  const { incomingPosition, outcomingPosition, impact, onClick } = data
  const { name, impactUnits, bestImage } = impact

  return (
    <div
      className="group pointer-events-auto relative isolate flex cursor-pointer flex-col items-center"
      style={{ width, height, maxHeight: height }}
      onClick={onClick}
    >
      {bestImage?.url && (
        <Image
          src={bestImage.url}
          alt={name}
          width={bestImage.width}
          height={bestImage.height}
          className="pointer-events-none aspect-video rounded-xl object-cover transition-all duration-300 group-hover:scale-110"
        />
      )}

      <div className="mt-5">
        <h2 className="text-center text-[15px] font-medium">{name}</h2>

        {(impactUnits || []).length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
            {impactUnits?.map((item) => (
              <Badge variant="secondary" className="font-normal" key={item.value + item.units}>
                {item.value} {item.units}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-2 text-center text-xs text-muted-foreground">
          <DateTime date={impact.date} relative />
        </div>
      </div>

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
