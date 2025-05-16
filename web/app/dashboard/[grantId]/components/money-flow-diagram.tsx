"use client"

import { Currency } from "@/components/ui/currency"
import { Profile } from "@/components/user-profile/get-user-profile"
import { User } from "@/lib/auth/user"
import { Grant } from "@/lib/database/types"
import { getIpfsUrl } from "@/lib/utils"
import { Background, type Edge, MarkerType, type Node, Position, ReactFlow } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import Image from "next/image"
import Link from "next/link"
import { BuyToken } from "./nodes/buy-token"
import DashboardNode, { IDashboardNode } from "./nodes/dashboard-node"
import GroupNode, { GroupAnchorNode, IGroupAnchorNode, IGroupNode } from "./nodes/group-node"
import SampleImage from "./plantation.jpg"

const COLUMN_WIDTH = 330
const COLUMN_SPACING = 180

const ROW_HEIGHT = 52
const ROW_SPACING = 24
const GROUP_PADDING = 30

interface Props {
  products: Array<{ name: string; image: string; url: string }>
  profiles: Array<Profile>
  user: User | undefined
  grant: Grant
  supports: Array<Pick<Grant, "id" | "title" | "image" | "tagline">>
}

export function MoneyFlowDiagram(props: Props) {
  const { products, profiles, user, grant, supports } = props

  const { nodes, height } = generateDiagram(
    [
      { col: 1, data: { label: "You support", image: user?.avatar } },
      {
        col: 2,
        data: {
          label: "VRBS Coffee",
          handles: [
            { type: "target", position: Position.Left },
            { type: "source", position: Position.Right },
          ],
          className: "bg-accent dark:bg-accent/25 text-accent-foreground",
          image: grant.image,
        },
      },
      { col: 3, data: { label: "You receive", image: user?.avatar } },
    ],
    [
      {
        col: 1,
        row: 1,
        height: 236,
        id: "user_action",
        title: "Order Coffee",
        className: "bg-background dark:bg-background/50 shadow",
        content: (
          <div className="pointer-events-auto grid grid-cols-2 gap-2.5">
            {products.slice(0, 2).map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                className="transition-hover flex flex-col items-center hover:opacity-80"
              >
                <Image
                  src={p.image}
                  alt={p.name}
                  width={80}
                  height={80}
                  className="aspect-square w-full rounded-md"
                />
                <span className="mt-1.5 line-clamp-1 text-[11px] text-muted-foreground">
                  {p.name}
                </span>
              </a>
            ))}
          </div>
        ),
        handles: [{ type: "source", position: Position.Right }],
      },
      {
        col: 1,
        row: 2,
        title: "Buy Token",
        id: "user_token",
        height: 280,
        content: <BuyToken />,
        handles: [{ type: "source", position: Position.Right }],
      },
      {
        col: 2,
        row: 1,
        id: "team",
        height: 96,
        title: ["Team", "40%"],
        content: (
          <div className="grid grid-cols-2 gap-2.5">
            {profiles
              .filter((p) => !!p.pfp_url)
              .map((p) => (
                <div key={p.address} className="flex items-center space-x-1.5">
                  <Image
                    src={p.pfp_url!}
                    alt={p.display_name}
                    width={48}
                    height={48}
                    className="size-7 rounded-full shadow"
                  />
                  <span className="text-sm">{p.display_name}</span>
                </div>
              ))}
          </div>
        ),
      },
      {
        col: 2,
        row: 2,
        height: 260,
        id: "costs1",
        title: ["Farmers & Roasting", "40%"],
        content: (
          <div>
            <Image
              src={SampleImage}
              alt="Plantation in Peru"
              className="aspect-video h-auto w-full rounded-md object-cover"
            />
            <div className="mt-1.5 text-center text-xs text-muted-foreground">
              Plantation X in Peru
            </div>
          </div>
        ),
      },
      {
        col: 2,
        row: 3,
        id: "public_goods",
        title: ["Public Goods", "10%"],
        height: 106,
        content: (
          <div className="text-pretty text-sm text-muted-foreground">
            Profits support team selected community initiatives
          </div>
        ),
      },
      {
        col: 2,
        row: 4,
        id: "treasury",
        title: ["Treasury", "10%"],
        height: 106,
        content: (
          <div className="flex flex-col justify-between text-sm text-muted-foreground">
            <div>
              <Currency className="font-medium">1293</Currency> balance
            </div>
            <div>
              <strong className="font-medium">283</strong> token owners
            </div>
          </div>
        ),
      },
      {
        col: 3,
        row: 1,
        id: "product",
        title: "Fresh roasted Coffee",
        height: 106,
        content: (
          <div className="text-pretty text-sm text-muted-foreground">
            Beans ready for your cup of espresso or pour over
          </div>
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
        title: "$BEANS",
        handles: [{ type: "target", position: Position.Left }],
        height: 106,
        content: (
          <div className="text-pretty text-sm text-muted-foreground">
            By ordering coffee, you receive $BEANS rewards
          </div>
        ),
      },
    ],
  )

  const edges: Edge[] = [
    {
      id: "c1_c2_1",
      source: "user_action",
      target: "column_2",
      style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
    },
    {
      id: "c1_c2_5",
      source: "user_token",
      target: "column_2",
      style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
    },
    {
      id: "c2_c3_1",
      source: "column_2",
      target: "product",
      style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
    },
    {
      id: "c2_c3_2",
      source: "column_2",
      target: "impact",
      style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
    },
    {
      id: "c2_c3_3",
      source: "column_2",
      target: "token",
      style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
    },
  ]

  return (
    <div style={{ width: "100%", height: height + 160 }}>
      <ReactFlow
        defaultNodes={nodes}
        defaultEdges={edges}
        fitView
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
        }}
      >
        <Background gap={32} />
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
        data: {
          // className: "bg-background border-primary",
          ...data,
          // bg-background border-green-500
        },
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
