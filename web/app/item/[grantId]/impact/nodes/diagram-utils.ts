import { Edge, Position } from "@xyflow/react"
import { ImpactBlock } from "../types"
import { IImpactNode } from "./impact-node"

const COLUMNS = 4
const NODE_WIDTH = 300
const NODE_HEIGHT = 200
const NODE_MARGIN_X = 150
const NODE_MARGIN_Y = 150

export function generateNodes(impactBlocks: ImpactBlock[]): IImpactNode[] {
  return impactBlocks.map((block, index) => {
    const row = Math.floor(index / COLUMNS) + 1
    const isReverseRow = row % 2 === 0

    const col = isReverseRow
      ? COLUMNS - (index % COLUMNS) // Reverse column order
      : (index % COLUMNS) + 1 // Normal column order

    const isFirstNode = index === 0
    const isLastNode = index === impactBlocks.length - 1

    return {
      id: `i${index + 1}`,
      type: "impact",
      position: {
        x: col * (NODE_WIDTH + NODE_MARGIN_X),
        y: row * (NODE_HEIGHT + NODE_MARGIN_Y),
      },
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      data: {
        impactBlock: block,
        incomingPosition: isFirstNode ? null : getIncomingPosition(col, isReverseRow),
        outcomingPosition: isLastNode ? null : getOutComingPosition(col, isReverseRow),
      },
    } satisfies IImpactNode
  })
}

export function generateEdges(impactBlocks: ImpactBlock[]) {
  return impactBlocks.slice(0, -1).map((_, index) => {
    return {
      id: `e${index + 1}-${index + 2}`,
      source: `i${index + 1}`,
      target: `i${index + 2}`,
    } satisfies Edge
  })
}

function getIncomingPosition(col: number, isReverseRow: boolean) {
  const isFirstInRow = isReverseRow ? col === COLUMNS : col === 1
  if (isFirstInRow) return "top" as Position.Top
  return isReverseRow ? ("right" as Position.Right) : ("left" as Position.Left)
}

function getOutComingPosition(col: number, isReverseRow: boolean) {
  const isLastInRow = isReverseRow ? col === 1 : col === COLUMNS
  if (isLastInRow) return "bottom" as Position.Bottom
  return isReverseRow ? ("left" as Position.Left) : ("right" as Position.Right)
}
