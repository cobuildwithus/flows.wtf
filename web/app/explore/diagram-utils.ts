import { IPoolNode } from "@/components/diagram/pool-node"
import { Grant } from "@prisma/flows"
import { Edge, MarkerType, Node, Position } from "@xyflow/react"

// Node dimensions
export const dimensions = {
  pool: { width: 420, height: 420 }, // Increased pool size
  flow: { width: 290, height: 290 }, // Increased flow size
  grant: { width: 150, height: 150 }, // Increased grant size
}

// Layout settings
export const diagramLayout = {
  center: { x: 0, y: 0 },
  flowRadius: 1100, // Increased radius for flows
  subgrantRadius: 125, // Increased radius for subgrants
}

export function createPoolNode(pool: Grant, flowCount: number): IPoolNode {
  const { width, height } = dimensions.pool
  return {
    type: "pool",
    id: "pool-1",
    position: {
      x: diagramLayout.center.x - width / 2,
      y: diagramLayout.center.y - height / 2,
    },
    data: { pool, flowCount },
    connectable: true, // Changed to true to allow connections
    width,
    height,
  }
}

export function positionInCircle(
  center: { x: number; y: number },
  radius: number,
  angle: number,
  nodeSize: { width: number; height: number },
) {
  return {
    x: center.x + radius * Math.cos(angle) - nodeSize.width / 2,
    y: center.y + radius * Math.sin(angle) - nodeSize.height / 2,
  }
}

export function createEdge(
  source: string,
  target: string,
  sourceHandle?: string,
  targetHandle?: string,
): Edge {
  return {
    id: `${source}-${target}`,
    source,
    target,
    type: "default",
    style: { strokeWidth: 2 },
    markerEnd: { type: MarkerType.Arrow },
    data: { animated: true },
    sourceHandle,
    targetHandle,
  }
}

export function angleToPosition(angle: number): Position {
  // Normalize angle to [0, 2π)
  angle = angle % (2 * Math.PI)
  if (angle < 0) angle += 2 * Math.PI

  // Determine quadrant based on angle
  if (angle < Math.PI / 4 || angle >= (7 * Math.PI) / 4) {
    return Position.Right // 315° - 45°
  } else if (angle < (3 * Math.PI) / 4) {
    return Position.Bottom // 45° - 135°
  } else if (angle < (5 * Math.PI) / 4) {
    return Position.Left // 135° - 225°
  } else if (angle < (7 * Math.PI) / 4) {
    return Position.Top // 225° - 315°
  } else {
    return Position.Right // fallback
  }
}

// get opposite position
export function getOppositePosition(position: Position): Position {
  return {
    [Position.Top]: Position.Bottom,
    [Position.Left]: Position.Right,
    [Position.Bottom]: Position.Top,
    [Position.Right]: Position.Left,
  }[position]
}

export function createFlowNode(
  flow: Grant,
  position: { x: number; y: number },
  angle: number,
): Node {
  const { width, height } = dimensions.flow
  const targetPosition = angleToPosition(angle)

  return {
    type: "flow",
    id: flow.id,
    data: { flow },
    position,
    connectable: false,
    width,
    height,
    targetPosition,
    sourcePosition: getOppositePosition(targetPosition),
  }
}

export function createGrantNode(
  grant: Grant,
  position: { x: number; y: number },
  angle: number,
): Node {
  const { width, height } = dimensions.grant
  const targetPosition = angleToPosition(angle)

  return {
    type: "grant",
    id: grant.id,
    data: { grant },
    position,
    connectable: false,
    width,
    height,
    targetPosition,
    sourcePosition: getOppositePosition(targetPosition),
  }
}