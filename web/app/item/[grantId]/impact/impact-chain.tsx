import { MarkerType, ReactFlow } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { ImpactNode } from "./nodes/impact-node"
import { getImpactBlocks } from "./sample-data"
import { generateEdges, generateNodes } from "./nodes/diagram-utils"

interface Props {
  grantId: string
}

export async function ImpactChain(props: Props) {
  const { grantId } = props
  const impactBlocks = await getImpactBlocks(grantId)

  const nodes = generateNodes(impactBlocks)
  const edges = generateEdges(impactBlocks)

  return (
    <div className="relative w-full" style={{ height: 900 }}>
      <ReactFlow
        defaultNodes={nodes}
        defaultEdges={edges}
        minZoom={0.3}
        maxZoom={1}
        nodeTypes={{ impact: ImpactNode }}
        fitView
        fitViewOptions={{
          maxZoom: 1,
          minZoom: 0.4,
        }}
        // colorMode="system"
        nodesDraggable={false}
        elementsSelectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        zoomOnDoubleClick={false}
        preventScrolling
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
          type: "bezier",
          markerEnd: { type: MarkerType.ArrowClosed },
        }}
      />
    </div>
  )
}
