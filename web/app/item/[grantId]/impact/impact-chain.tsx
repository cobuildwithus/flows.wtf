"use client"

import useWindowSize from "@/lib/hooks/use-window-size"
import { useQueryParams } from "@/lib/update-search-params"
import type { Impact } from "@prisma/flows"
import { ReactFlow } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import React, { useMemo } from "react"
import { ImpactDialog } from "./impact-dialog"
import { CustomBezierEdge } from "./nodes/custom-edge"
import { generateDiagram, MinimalNode } from "./nodes/impact-chain-utils"
import { ImpactNode } from "./nodes/impact-node"
import { LaunchNode } from "./nodes/launch-node"

interface Props {
  impacts: Impact[]
  activatedAt?: Date
  canEdit: boolean
  impactId?: string
}

export function ImpactChain(props: Props) {
  const { impacts, activatedAt, canEdit, impactId } = props
  const { width } = useWindowSize()
  const { updateQueryParam } = useQueryParams()

  const diagram = useMemo(() => {
    if (!width) return null

    const impactData: MinimalNode[] = [
      ...impacts.map((impact, index) => ({
        type: "impact",
        width: 280,
        height: impact.name.length > 22 ? 300 : 240,
        data: {
          impact,
          onClick: () => {
            updateQueryParam("impactId", impact.id)
          },
        },
      })),
    ]

    if (activatedAt) {
      impactData.push({
        type: "launch",
        width: 250,
        height: 240,
        data: { activatedAt: new Date(activatedAt) },
      })
    }

    return generateDiagram(impactData, width)
  }, [impacts, width, activatedAt, updateQueryParam])

  if (!diagram || !width) return null

  return (
    <>
      <div
        className="relative mx-auto w-full max-w-screen-2xl shrink-0"
        style={{ height: diagram.height }}
      >
        <ReactFlow
          nodes={diagram.nodes}
          edges={diagram.edges}
          minZoom={0.7}
          maxZoom={1}
          nodeTypes={{ impact: ImpactNode, launch: LaunchNode }}
          colorMode={"light"}
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
          }}
          edgeTypes={{ "custom-bezier": CustomBezierEdge }}
          viewport={{ x: width > 768 ? 56 : 0, y: 0, zoom: 1 }}
        />
      </div>

      <ImpactDialog impacts={impacts} impactId={impactId} canEdit={canEdit} />
    </>
  )
}
