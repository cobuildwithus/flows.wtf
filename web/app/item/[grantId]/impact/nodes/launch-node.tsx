"use client"

import { DateTime } from "@/components/ui/date-time"
import { Handle, Node, NodeProps, Position } from "@xyflow/react"
import Image from "next/image"
import { memo } from "react"
import LaunchImage from "./launch.png"

export type ILaunchNode = Node<{ activatedAt: Date }, "launch">

export function LaunchNode(props: NodeProps<ILaunchNode>) {
  const { activatedAt } = props.data

  return (
    <div className="group pointer-events-auto relative flex flex-col items-center overflow-hidden">
      <Image
        src={LaunchImage}
        alt="Project launch"
        height={180}
        width={180}
        className="rounded-full object-cover"
      />

      <div className="mt-4 px-4">
        <h2 className="mb-2 text-center text-sm font-medium">Project launch</h2>

        <div className="text-center text-xs text-muted-foreground">
          <DateTime date={activatedAt} shortDate />
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        isConnectable={false}
        className="!left-1/4 !border-0 !bg-transparent"
      />
    </div>
  )
}

export default memo(LaunchNode)
