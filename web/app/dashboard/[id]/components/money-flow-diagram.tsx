"use client"

import { Currency } from "@/components/ui/currency"
import { User } from "@/lib/auth/user"
import { Grant } from "@/lib/database/types"
import { Startup } from "@/lib/onchain-startup/startup"
import { TeamMember } from "@/lib/onchain-startup/team-members"
import { getIpfsUrl } from "@/lib/utils"
import { Background, MarkerType, type Node, Position, ReactFlow } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import Image from "next/image"
import Link from "next/link"
import { BuyRevnetToken } from "./nodes/buy-revnet-token"
import DashboardNode, { IDashboardNode } from "./nodes/dashboard-node"
import GroupNode, { GroupAnchorNode, IGroupAnchorNode, IGroupNode } from "./nodes/group-node"
import { Products } from "./nodes/products"
import { Reviews } from "./nodes/reviews"
import { ShortTeam } from "./nodes/short-team"
import { Treasury } from "./nodes/treasury"
import { TokenRewards } from "./nodes/token-rewards"
import { base } from "viem/chains"

const COLUMN_WIDTH = 340
const COLUMN_SPACING = 180

const ROW_HEIGHT = 52
const ROW_SPACING = 24
const GROUP_PADDING = 30

interface Props {
  products: Array<{ name: string; image: string; url: string }>
  members: Array<TeamMember>
  user: User | undefined
  startup: Startup
  supports: Array<Pick<Grant, "id" | "title" | "image" | "tagline">>
}

export function MoneyFlowDiagram(props: Props) {
  const { products, members, user, startup, supports } = props

  const { splits, diagram } = startup

  const { nodes, height } = generateDiagram(
    [
      { col: 1, data: { label: "You support", image: user?.avatar } },
      {
        col: 2,
        data: {
          label: startup.title,
          handles: [
            { type: "target", position: Position.Left },
            { type: "source", position: Position.Right },
          ],
          className: "bg-accent dark:bg-accent/25 text-accent-foreground",
          image: startup.image,
        },
      },
      { col: 3, data: { label: "You receive", image: user?.avatar } },
    ],
    [
      {
        col: 1,
        row: 1,
        height: 210,
        id: "user_action",
        title: startup.diagram.action.name,
        className: "bg-background dark:bg-background/50 shadow",
        content: <Products products={products.slice(0, 10)} />,
        handles: [{ type: "source", position: Position.Right }],
      },
      {
        col: 1,
        row: 2,
        title: "Join DAO",
        id: "user_token",
        height: 280,
        content: <BuyRevnetToken projectId={startup.revnetProjectIds.base} />,
        handles: [{ type: "source", position: Position.Right }],
      },
      {
        col: 2,
        row: 1,
        id: "team",
        height: 96,
        title: ["Team", `${splits.team * 100}%`],
        content: <ShortTeam members={members} />,
      },
      {
        col: 2,
        row: 2,
        id: "public_goods",
        title: ["Public Good", `${splits.support * 100}%`],
        height: 106,
        content: (
          <div className="text-pretty text-sm text-muted-foreground">
            Profits support community impact
          </div>
        ),
      },
      {
        col: 2,
        row: 3,
        id: "treasury",
        title: ["Treasury", `${splits.treasury * 100}%`],
        height: 106,
        content: <Treasury projectId={startup.revnetProjectIds.base} chainId={base.id} />,
      },
      ...splits.costs.map((c, ci) => ({
        col: 2,
        row: 4 + ci,
        height: c.image ? 260 : 92,
        id: `costs_${c.name}_${ci}`,
        title: [c.name, `${c.amount * 100}%`],
        content: (
          <div>
            {c.image && (
              <Image
                src={c.image}
                alt={c.description}
                className="aspect-video h-auto w-full rounded-md object-cover"
                width={298}
                height={168}
              />
            )}
            <div className="mt-1.5 text-center text-xs text-muted-foreground">{c.description}</div>
          </div>
        ),
      })),
      {
        col: 3,
        row: 1,
        id: "product",
        title: diagram.receive.name,
        height: startup.reviews.length > 0 ? 256 : 106,
        content: (
          <>
            <div className="mb-2.5 text-pretty text-sm text-muted-foreground">
              {diagram.receive.description}
            </div>
            <Reviews reviews={startup.reviews} />
          </>
        ),
        handles: [{ type: "target", position: Position.Left }],
      },
      {
        col: 3,
        row: 2,
        id: "impact",
        height: 52 + supports.length * 56,
        title: "Real world impact",
        content: (
          <div className="flex flex-col space-y-4">
            {supports.map((s) => (
              <Link
                href={`/item/${s.id}`}
                key={s.id}
                className="group pointer-events-auto flex items-center gap-2.5 transition-opacity hover:opacity-80"
              >
                <Image
                  src={getIpfsUrl(s.image)}
                  alt={s.title}
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-md object-cover"
                />
                <span className="line-clamp-2 text-sm text-muted-foreground">{s.title}</span>
              </Link>
            ))}
          </div>
        ),
        handles: [{ type: "target", position: Position.Left }],
      },
      {
        col: 3,
        row: 3,
        id: "token",
        title: `Token rewards`,
        handles: [{ type: "target", position: Position.Left }],
        height: 95,
        content: (
          <TokenRewards
            projectId={startup.revnetProjectIds.base}
            chainId={base.id}
            userAddress={user?.address}
          />
        ),
      },
    ],
  )

  return (
    <div style={{ width: "100%", height: height + 160 }}>
      <ReactFlow
        defaultNodes={nodes}
        defaultEdges={[
          { id: "c1_c2_1", source: "user_action", target: "column_2" },
          { id: "c1_c2_5", source: "user_token", target: "column_2" },
          { id: "c2_c3_1", source: "column_2", target: "product" },
          { id: "c2_c3_2", source: "column_2", target: "impact" },
          { id: "c2_c3_3", source: "column_2", target: "token" },
        ]}
        fitView
        fitViewOptions={{ minZoom: 0.75 }}
        panOnDrag={false}
        nodesDraggable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        zoomOnDoubleClick={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
        nodeTypes={{ dashboard: DashboardNode, group: GroupNode, groupAnchor: GroupAnchorNode }}
        defaultEdgeOptions={{
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
        }}
      >
        <Background gap={32} offset={-10} />
      </ReactFlow>
    </div>
  )
}

type ColumnProps = { col: number; data: IGroupNode["data"] }
type ItemProps = { col: number; row: number; id: string; height?: number } & IDashboardNode["data"]

function generateDiagram(
  columns: ColumnProps[],
  items: ItemProps[],
): { nodes: Node[]; height: number } {
  const colNodes: Node[] = []
  const itemsNodes: Node[] = []

  let height = 0

  for (const c of columns) {
    const colItems = items.filter((i) => i.col === c.col)
    const itemsCount = colItems.length
    const itemsHeight = colItems.reduce((acc, item) => acc + (item.height ?? ROW_HEIGHT), 0)
    colNodes.push(...group(c, itemsCount, itemsHeight))

    if (itemsHeight > height) height = itemsHeight

    let currentItemsHeight = 0
    for (const item of colItems) {
      const { id, col, row, height = ROW_HEIGHT, ...data } = item
      itemsNodes.push({
        id,
        parentId: `column_${col}`,
        type: "dashboard",
        position: {
          x: getX(1) + GROUP_PADDING,
          y: GROUP_PADDING + 32 + currentItemsHeight + Math.max(0, ROW_SPACING * (row - 1)),
        },
        data,
        width: COLUMN_WIDTH,
        height,
      })
      currentItemsHeight += height
    }
  }

  return { nodes: [...colNodes, ...itemsNodes], height }
}

function getX(column: number) {
  return COLUMN_WIDTH * (column - 1) + Math.max(0, COLUMN_SPACING * (column - 1))
}

function group(
  props: ColumnProps,
  itemsCount: number,
  itemsHeight: number,
): [IGroupNode, IGroupAnchorNode] {
  const { col, data } = props
  const width = COLUMN_WIDTH + GROUP_PADDING * 2

  const height = itemsHeight + itemsCount * ROW_SPACING + GROUP_PADDING * 2 + 16
  return [
    {
      id: `column_${col}_group`,
      type: "group",
      data,
      position: { x: getX(col), y: 0 },
      style: { width, height, background: "transparent", border: "none", padding: 0 },
    },
    {
      id: `column_${col}`,
      type: "groupAnchor",
      data,
      position: { x: getX(col), y: 0 },
      style: { width, height },
    },
  ]
}
