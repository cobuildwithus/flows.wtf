import FlowNode from "@/components/diagram/flow-node"
import grantNode from "@/components/diagram/grant-node"
import PoolNode from "@/components/diagram/pool-node"
import type { Grant } from "@prisma/flows"
import { Background, Edge, MarkerType, Node, ReactFlow } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { diagramLayout, createPoolNode, placeFlowAndSubgrants, dimensions } from "./diagram-utils"

export type DiagramGrant = Pick<Grant, "id" | "title" | "image">

type Props = {
  flows: (DiagramGrant & {
    subgrants: DiagramGrant[]
  })[]
  pool: Grant
  noScroll?: boolean
}

export const FullDiagram = (props: Props) => {
  const { flows, pool, noScroll = false } = props

  // Sort flows ascending by #subgrants => "least subgrants" at index 0
  const sortedFlows = [...flows].sort((a, b) => a.subgrants.length - b.subgrants.length)

  // Break the sorted flows into up to 3 "rings" of size 6 each
  const ring1 = sortedFlows.slice(0, 6)
  const ring2 = sortedFlows.slice(6, 12)
  const ring3 = sortedFlows.slice(12)

  // Build diagram elements
  const mainNodes: Node[] = [createPoolNode(pool, flows.length)]
  const edges: Edge[] = []
  const grantNodes: Node[] = []

  // Radii for the three rings (tweak to your liking)
  const ringRadius1 = diagramLayout.flowRadius * 0.7
  const ringRadius2 = diagramLayout.flowRadius * 1.5
  const ringRadius3 = diagramLayout.flowRadius * 2.4

  // We'll define a small helper that places a ring of flows evenly,
  // but also applies an angular offset so each ring is "rotated" relative to the others.
  function placeRing(
    ringFlows: (DiagramGrant & { subgrants: DiagramGrant[] })[],
    radius: number,
    offset: number = 0,
  ) {
    const count = ringFlows.length
    if (!count) return
    const angleStep = (2 * Math.PI) / count

    ringFlows.forEach((flow, i) => {
      const angle = offset + i * angleStep
      placeFlowAndSubgrants(flow, angle, radius, mainNodes, edges, grantNodes)
    })
  }

  // Ring 1 has no offset
  placeRing(ring1, ringRadius1, /* offset */ 0)

  // Ring 2 is offset by half of ring2's angle step => (π / ring2.length) if ring2 not empty
  if (ring2.length > 0) {
    const angleStep2 = (2 * Math.PI) / ring2.length
    const offset2 = angleStep2 / 2 // e.g. π / ring2.length
    placeRing(ring2, ringRadius2, offset2)
  }

  // Ring 3 is similarly offset by half of ring3's angle step
  if (ring3.length > 0) {
    const angleStep3 = (2 * Math.PI) / ring3.length
    const offset3 = angleStep3 / 2 // e.g. π / ring3.length
    placeRing(ring3, ringRadius3, offset3)
  }

  return (
    <div className="grow bg-background">
      <ReactFlow
        defaultNodes={[...mainNodes, ...grantNodes]}
        defaultEdges={edges}
        maxZoom={1}
        minZoom={0.3}
        fitView
        colorMode="system"
        nodesDraggable={false}
        snapToGrid
        fitViewOptions={{
          maxZoom: 1,
          minZoom: 0.4,
        }}
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
