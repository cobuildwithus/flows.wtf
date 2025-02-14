import database from "@/lib/database/edge"
import { MarkerType, ReactFlow } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { CustomBezierEdge } from "./nodes/custom-edge"
import { generateDiagram } from "./nodes/diagram-utils"
import { ImpactNode } from "./nodes/impact-node"
import { generateImpactNodes } from "./nodes/impact-nodes"
import { LaunchNode } from "./nodes/launch-node"

interface Props {
  grantId: string
  activatedAt: Date
}

export async function ImpactChain(props: Props) {
  const { grantId, activatedAt } = props

  const impacts = await database.impact.findMany({
    // where: { grantId },
    orderBy: { updatedAt: "asc" },
    take: 15,
  })

  const { nodes, edges, height } = generateDiagram([
    { type: "launch", width: 250, height: 240, data: { activatedAt } },
    ...generateImpactNodes(impacts),
  ])

  const edgeTypes = {
    "custom-bezier": CustomBezierEdge,
  }

  return (
    <div className="relative w-full shrink-0" style={{ height }}>
      <ReactFlow
        defaultNodes={[...nodes]}
        defaultEdges={edges}
        minZoom={0.7}
        maxZoom={1}
        nodeTypes={{ impact: ImpactNode, launch: LaunchNode }}
        // fitView
        // fitViewOptions={{
        //   maxZoom: 1,
        //   minZoom: 0.75,
        //   nodes: nodes.slice(0, 8),
        // }}
        // colorMode="system"
        nodesDraggable={false}
        elementsSelectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        panOnDrag={false}
        panOnScroll={false}
        proOptions={{ hideAttribution: true }}
        onlyRenderVisibleElements
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: "hsl(var(--primary) / 0.4)", strokeWidth: 2 },
          // markerEnd: { type: MarkerType.Arrow },
        }}
        edgeTypes={edgeTypes}
        viewport={{ x: 64, y: 0, zoom: 1 }}
      >
        {/* <Background /> */}
      </ReactFlow>
    </div>
  )
}
