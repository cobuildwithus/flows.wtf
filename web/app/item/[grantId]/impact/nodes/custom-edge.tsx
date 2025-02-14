"use client"

import { BaseEdge, EdgeProps, getBezierPath } from "@xyflow/react"

export function CustomBezierEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 5,
  })

  return <BaseEdge path={path} markerEnd={markerEnd} style={style} />
}
