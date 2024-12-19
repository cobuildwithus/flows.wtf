"use client"

import { Currency } from "@/components/ui/currency"
import { getIpfsUrl } from "@/lib/utils"
import { Grant } from "@prisma/flows"
import { Handle, Node, NodeProps, Position } from "@xyflow/react"
import Image from "next/image"
import Link from "next/link"
import { memo } from "react"

export type IGrantNode = Node<{ grant: Grant }, "grant">

function GrantNode(props: NodeProps<IGrantNode>) {
  const { targetPosition = Position.Top, width, height } = props
  const { image, title, monthlyIncomingFlowRate, id } = props.data.grant

  return (
    <Link href={`/item/${id}`} className="block">
      <div
        className="group pointer-events-auto relative isolate inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-full border bg-card p-6"
        style={{ width, height }}
      >
        {image && (
          <div className="pointer-events-none absolute inset-0 -z-10 size-full overflow-hidden rounded-full">
            <Image
              src={getIpfsUrl(image)}
              alt={title}
              className="blur-xs size-full object-cover transition-[filter] duration-200 group-hover:blur-sm"
              width={220}
              height={120}
              priority
            />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-gray-900/80 via-gray-900/40" />

        <h2
          className={`whitespace-nowrap text-center text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 ${title.length > 10 ? "group-hover:animate-marquee" : ""}`}
        >
          {title}
        </h2>

        <div className="absolute bottom-2 left-1/2 w-full -translate-x-1/2 rounded bg-primary px-2 py-1 text-center text-xs font-medium text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
          <Currency>{monthlyIncomingFlowRate}</Currency>
          /mo
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
      </div>
    </Link>
  )
}

export default memo(GrantNode)
