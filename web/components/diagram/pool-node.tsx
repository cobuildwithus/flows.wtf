"use client"

import { Currency } from "@/components/ui/currency"
import { getIpfsUrl } from "@/lib/utils"
import { Grant } from "@prisma/flows"
import { Handle, Node, NodeProps, Position } from "@xyflow/react"
import Image from "next/image"
import { memo } from "react"

export type IPoolNode = Node<{ pool: Grant; flowCount: number }, "pool">

function PoolNode(props: NodeProps<IPoolNode>) {
  const { sourcePosition = Position.Bottom, width, height } = props
  const { image, title, monthlyOutgoingFlowRate } = props.data.pool

  return (
    <div
      className="pointer-events-auto relative isolate inline-flex cursor-auto items-center justify-center overflow-hidden rounded-full border bg-card"
      style={{ width, height }}
    >
      {image && (
        <div className="pointer-events-none absolute inset-0 z-10 size-full overflow-hidden rounded-full">
          <Image
            src={getIpfsUrl(image)}
            alt={title}
            className="size-full object-cover blur-md"
            width={280}
            height={280}
            priority
          />
        </div>
      )}

      <div className="z-10 flex flex-col items-center justify-center space-y-14">
        <div className="text-5xl font-bold text-white">{title}</div>
        <div className="mt-3 rounded-md bg-primary px-2.5 py-1 text-2xl font-medium text-primary-foreground">
          <Currency>{monthlyOutgoingFlowRate}</Currency>
          /mo
        </div>
      </div>

      <Handle
        id="top"
        type="source"
        position={Position.Top}
        isConnectable={false}
        style={{ background: "var(--color-primary)", top: "50%" }}
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        isConnectable={false}
        style={{ background: "var(--color-primary)", right: "50%" }}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        style={{ background: "var(--color-primary)", bottom: "50%" }}
      />
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        isConnectable={false}
        style={{ background: "var(--color-primary)", left: "50%", zIndex: -10 }}
      />
    </div>
  )
}

export default memo(PoolNode)
