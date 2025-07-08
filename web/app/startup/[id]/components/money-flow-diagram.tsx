"use client"

import { User } from "@/lib/auth/user"
import { Grant } from "@/lib/database/types"
import useWindowSize from "@/lib/hooks/use-window-size"
import { Startup } from "@/lib/onchain-startup/startup"
import { TeamMember } from "@/lib/onchain-startup/team-members"
import { getIpfsUrl } from "@/lib/utils"
import { Background, MarkerType, type Node, Position, ReactFlow } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import Image from "next/image"
import { JoinStartupLink } from "./join-startup-link"
import { TokenDAOLink } from "./token-dao-link"
import { BuyRevnetToken } from "./nodes/buy-revnet-token"
import DashboardNode, { IDashboardNode } from "./nodes/dashboard-node"
import GroupNode, { GroupAnchorNode, IGroupAnchorNode, IGroupNode } from "./nodes/group-node"
import { ProductsList } from "./nodes/products-list"
import { Reviews } from "./nodes/reviews"
import { ShortTeam } from "./nodes/short-team"
import { TokenRewards } from "./nodes/token-rewards"
import { Treasury } from "./nodes/treasury"
import { TreasuryTitle } from "./treasury-title"
import { useFundraiseIllustration } from "../hooks/use-fundraise-illustration"
import { MoneyFlowSkeleton } from "./money-flow-skeleton"
import { ImpactGrants } from "./nodes/impact-grants"
import { TitleWithFlowRate } from "./title-with-flow-rate"
import { Revenue } from "@/lib/onchain-startup/types"

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
  totalBudget: number
  impactGrants: {
    grants: Pick<Grant, "id" | "title" | "image">[]
    monthlyFlowRate: number
    flowId: string
  }
  revenue: Revenue
}

export function MoneyFlowDiagram(props: Props) {
  const { products, members, user, startup, impactGrants, totalBudget, revenue } = props
  const { width } = useWindowSize()
  const {
    productsVolumeEth,
    setProductsVolumeEth,
    tokenVolume,
    setTokenVolumeEth,
    totalRevnetTokens,
  } = useFundraiseIllustration(startup.revnetProjectIds.base, startup.chainId)

  if (!width)
    return (
      <div className="mb-6 mt-1.5 px-2">
        <MoneyFlowSkeleton />
      </div>
    )

  const { diagram } = startup
  const isMobile = checkMobile(width)

  const { nodes, height } = generateDiagram(
    [
      {
        col: 1,
        data: {
          label: `Join ${startup.title}`,
          image: user?.avatar,
          handles: isMobile ? [{ type: "source", position: Position.Bottom }] : [],
        },
      },
      {
        col: 2,
        data: {
          handles: [
            { type: "target", position: isMobile ? Position.Top : Position.Left },
            { type: "source", position: isMobile ? Position.Bottom : Position.Right },
          ],
          className: "bg-accent dark:bg-accent/25 text-accent-foreground",
          contentHeight: 200,
          content: (
            <div className="relative flex h-[200px] flex-col items-start justify-end p-5 text-left">
              <Image
                src={getIpfsUrl(startup.image, "pinata")}
                alt={startup.title}
                width={298}
                height={200}
                className="absolute inset-0 size-full object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/80 to-accent dark:from-transparent dark:via-black/60 dark:to-black/75" />

              <div className="relative">
                <h3 className="text-2xl font-bold tracking-tight text-accent-foreground dark:text-white sm:text-3xl">
                  {startup.title}
                </h3>
                <div className="mt-1 text-sm text-accent-foreground/90 dark:text-white/90 sm:text-base">
                  {startup.mission}
                </div>
              </div>
            </div>
          ),
        },
      },
      {
        col: 3,
        data: {
          label: "You receive",
          image: user?.avatar,
          handles: isMobile ? [{ type: "target", position: Position.Top }] : [],
        },
      },
    ],
    [
      {
        col: 1,
        row: 1,
        title: (
          <JoinStartupLink
            startupTitle={startup.title}
            projectId={startup.revnetProjectIds.base}
            chainId={startup.chainId}
          />
        ),
        id: "user_token",
        height: 285,
        content: (
          <BuyRevnetToken
            projectId={startup.revnetProjectIds.base}
            changeTokenVolumeEth={(eth) => setTokenVolumeEth(eth)}
            chainId={startup.chainId}
          />
        ),
        handles: isMobile ? [] : [{ type: "source", position: Position.Right }],
      },
      {
        col: 1,
        row: 2,
        height: 320,
        id: "user_action",
        title: "Shop to earn",
        className: "bg-background dark:bg-background/50 shadow",
        content: (
          <ProductsList
            changeProductsVolumeEth={(eth) => setProductsVolumeEth(eth)}
            products={products.slice(0, 10)}
            startup={startup}
            chainId={startup.chainId}
          />
        ),
        handles: isMobile ? [] : [{ type: "source", position: Position.Right }],
      },
      {
        col: 2,
        row: 1,
        id: "team",
        height: 100,
        title: (
          <TitleWithFlowRate title="Team" flowId={startup.impactFlowId} totalBudget={totalBudget} />
        ),
        content: <ShortTeam members={members} />,
      },
      // {
      //   col: 2,
      //   row: 2,
      //   id: "public_goods",
      //   title: ["Public Good", `$${splits.support * 100}/mo`],
      //   height: 90,
      //   content: (
      //     <div className="text-pretty text-sm text-muted-foreground">
      //       Profits support community impact
      //     </div>
      //   ),
      // },
      {
        col: 2,
        row: 3,
        id: "treasury",
        title: (
          <TreasuryTitle
            startup={startup}
            chainId={startup.chainId}
            ethRaised={productsVolumeEth + tokenVolume}
          />
        ),
        height: 90,
        content: <Treasury projectId={startup.revnetProjectIds.base} chainId={startup.chainId} />,
      },
      {
        col: 3,
        row: 1,
        id: "product",
        title: diagram.receive.name,
        height: startup.reviews.length > 0 ? 200 : 106,
        content: <Reviews reviews={startup.reviews} />,
        handles: isMobile ? [] : [{ type: "target", position: Position.Left }],
      },
      {
        col: 3,
        row: 2,
        id: "impact",
        height: impactGrants.grants.length > 0 ? 52 + impactGrants.grants.length * 56 : 90,
        title: (
          <TitleWithFlowRate
            title="Real world impact"
            flowId={impactGrants.flowId}
            totalBudget={impactGrants.monthlyFlowRate}
          />
        ),
        content: <ImpactGrants grants={impactGrants.grants} />,
        handles: isMobile ? [] : [{ type: "target", position: Position.Left }],
      },
      {
        col: 3,
        row: 3,
        id: "token",
        title: (
          <TokenDAOLink
            startupTitle={startup.title}
            projectId={startup.revnetProjectIds.base}
            chainId={startup.chainId}
            tokenAmount={Number(totalRevnetTokens)}
          />
        ),
        handles: isMobile ? [] : [{ type: "target", position: Position.Left }],
        height: Number(totalRevnetTokens) > 0 ? 145 : 95,
        content: (
          <TokenRewards
            projectId={startup.revnetProjectIds.base}
            chainId={startup.chainId}
            userAddress={user?.address}
            extraRevnetTokens={totalRevnetTokens}
            startupTitle={startup.title}
          />
        ),
      },
    ],
    width - 34,
  )

  return (
    <div style={{ width: "100%", height }} className="touch-pan-y max-sm:mt-4">
      <ReactFlow
        nodes={nodes}
        defaultEdges={
          isMobile
            ? [
                { id: "c1_c2", source: "column_1", target: "column_2" },
                { id: "c2_c3", source: "column_2", target: "column_3" },
              ]
            : [
                { id: "c1_c2_1", source: "user_action", target: "column_2" },
                { id: "c1_c2_5", source: "user_token", target: "column_2" },
                { id: "c2_c3_1", source: "column_2", target: "product" },
                { id: "c2_c3_2", source: "column_2", target: "impact" },
                { id: "c2_c3_3", source: "column_2", target: "token" },
              ]
        }
        fitView={width > 768}
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
        style={{ touchAction: "pan-y" }}
      >
        {!isMobile && <Background gap={32} />}
      </ReactFlow>
    </div>
  )
}

type ColumnProps = { col: number; data: IGroupNode["data"]; content?: React.ReactNode }
type ItemProps = { col: number; row: number; id: string; height?: number } & IDashboardNode["data"]

function generateDiagram(
  columns: ColumnProps[],
  items: ItemProps[],
  width: number,
): { nodes: Node[]; height: number } {
  const colNodes: Node[] = []
  const itemsNodes: Node[] = []

  let height = 0

  const isMobile = width < 768

  for (const c of columns) {
    const colItems = items.filter((i) => i.col === c.col)
    const itemsCount = colItems.length
    const contentHeight = c.data.contentHeight || 32
    const itemsHeight = colItems.reduce((acc, item) => acc + (item.height ?? ROW_HEIGHT), 0)

    colNodes.push(...group(c, itemsCount, itemsHeight, width, height))

    let y = contentHeight + GROUP_PADDING

    for (const item of colItems) {
      const { id, col, row, height = ROW_HEIGHT, ...data } = item
      itemsNodes.push({
        id,
        parentId: `column_${col}`,
        type: "dashboard",
        position: { x: isMobile ? 8 : getX(1) + GROUP_PADDING, y },
        data,
        width: isMobile ? width - 16 : COLUMN_WIDTH,
        height,
      })
      y += height + ROW_SPACING
    }

    y += GROUP_PADDING

    if (isMobile) {
      height += y + 16
    } else {
      if (itemsHeight > height) height = y
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
  screenWidth: number,
  marginTop: number,
): [IGroupNode, IGroupAnchorNode] {
  const { col, data } = props

  const contentHeight = data.contentHeight || 32
  const isMobile = checkMobile(screenWidth)

  const width = isMobile ? screenWidth : COLUMN_WIDTH + GROUP_PADDING * 2
  const height = contentHeight + itemsHeight + itemsCount * ROW_SPACING + GROUP_PADDING

  const x = isMobile ? 0 : getX(col)
  const y = isMobile ? (col === 1 ? 0 : marginTop + (col - 1) * 16) : 0

  return [
    {
      id: `column_${col}_group`,
      type: "group",
      data,
      position: { x, y },
      style: { width, height, background: "transparent", border: "none", padding: 0 },
    },
    {
      id: `column_${col}`,
      type: "groupAnchor",
      data,
      position: { x, y },
      style: { width, height },
    },
  ]
}

function checkMobile(width: number) {
  return width < 768
}
