import { Edge, MarkerType, Node, Position } from "@xyflow/react"

const COLUMNS = 4
const NODE_MARGIN_X = 64
const NODE_MARGIN_Y = 200
const NODE_Y_STEP = 25

type MinimalNode = Omit<Node, "id" | "position"> & { width: number; height: number }

export function generateDiagram(nodes: MinimalNode[]) {
  const rows = Math.ceil(nodes.length / COLUMNS)

  const rowHeights = Array.from({ length: rows }, (_, rowIndex) => {
    const rowNodes = nodes.slice(rowIndex * COLUMNS, (rowIndex + 1) * COLUMNS)
    return Math.max(...rowNodes.map((node) => node.height))
  }).reduce((acc, h) => acc + h, 0)

  const height = rowHeights + (rows - 1) * NODE_MARGIN_Y + rows * (COLUMNS * NODE_Y_STEP)

  return { nodes: positionNodes(nodes), edges: generateEdges(nodes), height }
}

function positionNodes(nodes: MinimalNode[]): Node[] {
  return nodes.map((node, index) => {
    const row = Math.floor(index / COLUMNS) + 1
    const isReverseRow = row % 2 === 0
    const col = isReverseRow ? COLUMNS - (index % COLUMNS) : (index % COLUMNS) + 1

    return {
      ...node,
      id: `i${index + 1}`,
      position: {
        x: (col - 1) * (node.width + NODE_MARGIN_X) + (isReverseRow ? node.width / 2 : 0),
        y:
          (row - 1) * (node.height + NODE_MARGIN_Y) +
          (isReverseRow ? Math.abs(col - COLUMNS) : col) * NODE_Y_STEP,
      },
      data: {
        ...node.data,
        incomingPosition: getIncomingPosition(col, isReverseRow),
        outcomingPosition: getOutComingPosition(col, isReverseRow),
      },
    }
  })
}

function generateEdges(nodes: MinimalNode[]) {
  return nodes.slice(0, -1).map((_, index) => {
    return {
      id: `e${index + 1}-${index + 2}`,
      source: `i${index + 1}`,
      target: `i${index + 2}`,
      type: "custom-bezier",
      markerEnd: { type: MarkerType.Arrow },
    } satisfies Edge
  })
}

function getIncomingPosition(col: number, isReverseRow: boolean) {
  const isFirstInRow = isReverseRow ? col === COLUMNS : col === 1
  if (isFirstInRow) return isReverseRow ? ("top" as Position.Top) : ("top" as Position.Left)
  return isReverseRow ? ("right" as Position.Right) : ("left" as Position.Left)
}

function getOutComingPosition(col: number, isReverseRow: boolean) {
  // const isLastInRow = isReverseRow ? col === 1 : col === COLUMNS
  // if (isLastInRow) return isReverseRow ? ("bottom" as Position.Bottom) : ("right" as Position.Right)
  return isReverseRow ? ("left" as Position.Left) : ("right" as Position.Right)
}
