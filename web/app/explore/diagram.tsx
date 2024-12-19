import FlowNode from "@/components/diagram/flow-node"
import grantNode from "@/components/diagram/grant-node"
import PoolNode, { IPoolNode } from "@/components/diagram/pool-node"
import { Grant } from "@prisma/flows"
import { Background, Edge, MarkerType, Node, Position, ReactFlow } from "@xyflow/react"
import "@xyflow/react/dist/style.css"

// Node dimensions
const dimensions = {
  pool: { width: 420, height: 420 }, // Increased pool size
  flow: { width: 280, height: 280 }, // Increased flow size
  grant: { width: 160, height: 120 }, // Increased grant size
}

// Layout settings
const layout = {
  center: { x: 0, y: 0 },
  flowRadius: 1000, // Increased radius for flows
  subgrantRadius: 120, // Increased radius for subgrants
}

function createPoolNode(pool: Grant, flowCount: number): IPoolNode {
  const { width, height } = dimensions.pool
  return {
    type: "pool",
    id: "pool-1",
    position: {
      x: layout.center.x - width / 2,
      y: layout.center.y - height / 2,
    },
    data: { pool, flowCount },
    connectable: true, // Changed to true to allow connections
    width,
    height,
  }
}

function positionInCircle(
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

function createEdge(
  source: string,
  target: string,
  sourceHandle?: string,
  targetHandle?: string,
): Edge {
  return {
    id: `${source}-${target}`,
    source,
    target,
    type: "bezier",
    style: { strokeWidth: 2 },
    markerEnd: { type: MarkerType.Arrow },
    data: { animated: true },
    sourceHandle,
    targetHandle,
  }
}

function angleToPosition(angle: number): Position {
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
function getOppositePosition(position: Position): Position {
  return {
    [Position.Top]: Position.Bottom,
    [Position.Left]: Position.Right,
    [Position.Bottom]: Position.Top,
    [Position.Right]: Position.Left,
  }[position]
}

function createFlowNode(flow: Grant, position: { x: number; y: number }, angle: number): Node {
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

function createGrantNode(grant: Grant, position: { x: number; y: number }, angle: number): Node {
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

type Props = {
  flows: (Grant & { subgrants: Grant[] })[]
  pool: Grant
}

export const FullDiagram = (props: Props) => {
  const { flows, pool } = props

  // Build diagram elements
  const mainNodes: Node[] = [createPoolNode(pool, flows.length)]
  const edges: Edge[] = []
  const grantNodes: Node[] = []
  const flowAngleStep = (2 * Math.PI) / (flows.length || 1)

  flows.forEach((flow, index) => {
    const flowAngle = flowAngleStep * index
    const flowPosition = positionInCircle(
      layout.center,
      layout.flowRadius * (index === flows.length - 1 ? 1.5 : index % 2 === 0 ? 1 : 1.75),
      flowAngle,
      dimensions.flow,
    )

    mainNodes.push(createFlowNode(flow, flowPosition, flowAngle))

    // Normalize angle to be between 0 and 2π
    const normalizedAngle = ((flowAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

    // Determine source handle based on angle from pool to flow
    let sourceHandle = "right"
    if (normalizedAngle > (Math.PI * 7) / 4 || normalizedAngle <= Math.PI / 4) {
      sourceHandle = "right"
    } else if (normalizedAngle <= (Math.PI * 3) / 4) {
      sourceHandle = "bottom"
    } else if (normalizedAngle <= (Math.PI * 5) / 4) {
      sourceHandle = "left"
    } else if (normalizedAngle <= (Math.PI * 7) / 4) {
      sourceHandle = "top"
    }

    // Target handle on flow node should be opposite of source
    const targetHandle = {
      right: "left",
      bottom: "top",
      left: "right",
      top: "bottom",
    }[sourceHandle]

    edges.push(createEdge("pool-1", flow.id, sourceHandle, targetHandle))

    if (flow.subgrants.length > 0) {
      const subgrantAngleStep = (2 * Math.PI) / flow.subgrants.length
      const flowCenter = {
        x: flowPosition.x + dimensions.flow.width / 2,
        y: flowPosition.y + dimensions.flow.height / 2,
      }

      flow.subgrants.forEach((grant, subIndex) => {
        const subgrantAngle = subgrantAngleStep * subIndex
        const grantPosition = positionInCircle(
          flowCenter,
          layout.subgrantRadius * Math.max(2, Math.sqrt(flow.subgrants.length)),
          subgrantAngle,
          dimensions.grant,
        )

        grantNodes.push(createGrantNode(grant, grantPosition, subgrantAngle))

        // Determine handles based on angle between nodes
        const normalizedAngle = ((subgrantAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

        // Source handle (flow node)
        let sourceHandle = "right"
        if (normalizedAngle > (Math.PI * 7) / 4 || normalizedAngle <= (Math.PI * 1) / 4) {
          sourceHandle = "right"
        } else if (normalizedAngle <= (Math.PI * 3) / 4) {
          sourceHandle = "bottom"
        } else if (normalizedAngle <= (Math.PI * 5) / 4) {
          sourceHandle = "left"
        } else if (normalizedAngle <= (Math.PI * 7) / 4) {
          sourceHandle = "top"
        }

        // Target handle (grant node) - opposite of source
        const targetHandle = {
          right: "left",
          bottom: "top",
          left: "right",
          top: "bottom",
        }[sourceHandle]

        edges.push(createEdge(flow.id, grant.id, sourceHandle, targetHandle))
      })
    }
  })

  return (
    <div className="grow bg-background">
      <ReactFlow
        defaultNodes={[...mainNodes, ...grantNodes]}
        defaultEdges={edges}
        fitView
        maxZoom={1}
        colorMode="system"
        nodesDraggable={false}
        snapToGrid
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
        nodeTypes={{
          flow: FlowNode,
          pool: PoolNode,
          grant: grantNode,
        }}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed },
        }}
      >
        <Background gap={32} />
      </ReactFlow>
    </div>
  )
}
