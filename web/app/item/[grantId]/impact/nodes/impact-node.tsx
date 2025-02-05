"use client"

import { Handle, Node, NodeProps, Position } from "@xyflow/react"
import { memo } from "react"
import { ImpactBlock } from "../types"

export type IImpactNode = Node<
  {
    impactBlock: ImpactBlock
    incomingPosition: Position | null
    outcomingPosition: Position | null
  },
  "impact"
>

export function ImpactNode(props: NodeProps<IImpactNode>) {
  const { width, height, id, data } = props
  const { incomingPosition, outcomingPosition, impactBlock } = data
  const { title, impactUnits } = impactBlock

  return (
    <div
      className="group pointer-events-auto relative isolate inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-full border bg-card p-6"
      style={{ width, height }}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-gray-900/80 via-gray-900/40" />

      <h2 className="whitespace-nowrap text-center text-sm font-medium">
        {id}-{incomingPosition}-{outcomingPosition}
      </h2>

      {/* {impactUnits.map((item) => (
        <div key={item.name}>
          <h3>{item.name}</h3>
          <p>
            {item.value} {item.unit}
          </p>
        </div>
      ))} */}

      {incomingPosition && <Handle type="target" position={incomingPosition} />}
      {outcomingPosition && <Handle type="source" position={outcomingPosition} />}
    </div>
  )
}

export default memo(ImpactNode)
