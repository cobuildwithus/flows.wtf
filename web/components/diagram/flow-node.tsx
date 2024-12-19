"use client"

import { Currency } from "@/components/ui/currency"
import { getIpfsUrl } from "@/lib/utils"
import { Grant } from "@prisma/flows"
import { Handle, Node, NodeProps, Position } from "@xyflow/react"
import Image from "next/image"
import Link from "next/link"
import { memo } from "react"

export type IFlowNode = Node<{ flow: Grant }, "flow">

function FlowNode(props: NodeProps<IFlowNode>) {
  const { targetPosition = Position.Left, sourcePosition = Position.Right, width, height } = props
  const { image, title, monthlyIncomingFlowRate, id } = props.data.flow

  return (
    <Link href={`/flow/${id}`} className="block">
      <div
        className="group pointer-events-auto relative isolate inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-full border bg-card"
        style={{ width, height }}
      >
        {image && (
          <div className="pointer-events-none absolute inset-0 -z-10 size-full overflow-hidden rounded-full">
            <Image
              src={getIpfsUrl(image)}
              alt={title}
              className="size-full animate-pulse object-cover blur-md"
              width={240}
              height={240}
              priority
            />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-gray-900/30 via-gray-900/10" />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="px-6 text-center text-3xl font-medium text-white">{title}</div>
          <div className="rounded-md bg-primary px-2.5 py-1 font-medium text-primary-foreground">
            <Currency>{monthlyIncomingFlowRate}</Currency>
            /mo
          </div>
        </div>

        <Handle
          type="target"
          id="top"
          position={Position.Top}
          isConnectable={false}
          style={{ background: "var(--color-primary)" }}
        />
        <Handle
          type="target"
          id="right"
          position={Position.Right}
          isConnectable={false}
          style={{ background: "var(--color-primary)" }}
        />
        <Handle
          type="target"
          id="bottom"
          position={Position.Bottom}
          isConnectable={false}
          style={{ background: "var(--color-primary)" }}
        />
        <Handle
          type="target"
          id="left"
          position={Position.Left}
          isConnectable={false}
          style={{ background: "var(--color-primary)" }}
        />

        <Handle
          type="source"
          id="top"
          position={Position.Top}
          isConnectable={false}
          style={{ background: "var(--color-primary)" }}
        />
        <Handle
          type="source"
          id="right"
          position={Position.Right}
          isConnectable={false}
          style={{ background: "var(--color-primary)" }}
        />
        <Handle
          type="source"
          id="bottom"
          position={Position.Bottom}
          isConnectable={false}
          style={{ background: "var(--color-primary)" }}
        />
        <Handle
          type="source"
          id="left"
          position={Position.Left}
          isConnectable={false}
          style={{ background: "var(--color-primary)" }}
        />
      </div>
    </Link>
  )
}

export default memo(FlowNode)
