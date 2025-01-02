import FlowNode from "@/components/diagram/flow-node"
import grantNode from "@/components/diagram/grant-node"
import PoolNode from "@/components/diagram/pool-node"
import { Grant } from "@prisma/flows"
import { Background, Edge, MarkerType, Node, ReactFlow } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import {
  createEdge,
  dimensions,
  diagramLayout,
  createGrantNode,
  createFlowNode,
  createPoolNode,
  positionInCircle,
} from "./diagram-utils"

type Props = {
  flows: (Grant & { subgrants: Grant[] })[]
  pool: Grant
  noScroll?: boolean
}

export const FullDiagram = (props: Props) => {
  const { flows, pool, noScroll = false } = props

  // Build diagram elements
  const mainNodes: Node[] = [createPoolNode(pool, flows.length)]
  const edges: Edge[] = []
  const grantNodes: Node[] = []
  const flowAngleStep = (2 * Math.PI) / (flows.length || 1)

  flows.forEach((flow, index) => {
    const flowAngle = flowAngleStep * index
    const flowPosition = positionInCircle(
      diagramLayout.center,
      diagramLayout.flowRadius * (index === flows.length - 1 ? 1.5 : index % 2 === 0 ? 1 : 1.75),
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
          diagramLayout.subgrantRadius * Math.max(2, Math.sqrt(flow.subgrants.length)),
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
        preventScrolling={!noScroll}
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
