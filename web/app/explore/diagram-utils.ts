import { IPoolNode } from "@/components/diagram/pool-node"
import { Grant } from "@prisma/flows"
import { Edge, MarkerType, Node, Position } from "@xyflow/react"
import { DiagramGrant } from "./diagram"

// Node dimensions
export const dimensions = {
  pool: { width: 420, height: 420 }, // Increased pool size
  flow: { width: 290, height: 290 }, // Increased flow size
  grant: { width: 150, height: 150 }, // Increased grant size
}

// Layout settings
export const diagramLayout = {
  center: { x: 0, y: 0 },
  flowRadius: 1400, // Further increased radius for flows to create more spacing
  subgrantRadius: 130, // Further increased radius for subgrants to create more spacing
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
  flow: DiagramGrant,
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
  grant: DiagramGrant,
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

// This helper places a single flow node on a given ring, connects it from the pool,
// and also places its subgrants in a small circle around it.
export function placeFlowAndSubgrants(
  flow: DiagramGrant & { subgrants: DiagramGrant[] },
  angle: number,
  ringRadius: number,
  mainNodes: Node[],
  edges: Edge[],
  grantNodes: Node[],
) {
  // Compute the flow node position
  const flowPos = positionInCircle(diagramLayout.center, ringRadius, angle, dimensions.flow)
  // Create the flow node
  mainNodes.push(createFlowNode(flow, flowPos, angle))

  // Connect this flow to the pool in the usual way
  const normAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  let sourceHandle = "right"
  if (normAngle > (7 * Math.PI) / 4 || normAngle <= Math.PI / 4) {
    sourceHandle = "right"
  } else if (normAngle <= (3 * Math.PI) / 4) {
    sourceHandle = "bottom"
  } else if (normAngle <= (5 * Math.PI) / 4) {
    sourceHandle = "left"
  } else if (normAngle <= (7 * Math.PI) / 4) {
    sourceHandle = "top"
  }
  const targetHandle = {
    right: "left",
    bottom: "top",
    left: "right",
    top: "bottom",
  }[sourceHandle]
  edges.push(createEdge("pool-1", flow.id, sourceHandle, targetHandle))

  // Place subgrants in a small circle around the flow
  if (flow.subgrants.length) {
    const subgrantAngleStep = (2 * Math.PI) / flow.subgrants.length
    const flowCenter = {
      x: flowPos.x + dimensions.flow.width / 2,
      y: flowPos.y + dimensions.flow.height / 2,
    }
    flow.subgrants.forEach((grant, i) => {
      const subAngle = i * subgrantAngleStep
      const grantPos = positionInCircle(
        flowCenter,
        diagramLayout.subgrantRadius * Math.max(2, Math.sqrt(flow.subgrants.length)),
        subAngle,
        dimensions.grant,
      )
      grantNodes.push(createGrantNode(grant, grantPos, subAngle))

      // Edge from flow to subgrant
      const normSubAngle = ((subAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
      let sgSource = "right"
      if (normSubAngle > (7 * Math.PI) / 4 || normSubAngle <= Math.PI / 4) {
        sgSource = "right"
      } else if (normSubAngle <= (3 * Math.PI) / 4) {
        sgSource = "bottom"
      } else if (normSubAngle <= (5 * Math.PI) / 4) {
        sgSource = "left"
      } else if (normSubAngle <= (7 * Math.PI) / 4) {
        sgSource = "top"
      }
      const sgTarget = {
        right: "left",
        bottom: "top",
        left: "right",
        top: "bottom",
      }[sgSource]
      edges.push(createEdge(flow.id, grant.id, sgSource, sgTarget))
    })
  }
}
