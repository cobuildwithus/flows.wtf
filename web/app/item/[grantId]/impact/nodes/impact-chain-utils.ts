import { Edge, MarkerType, Node, Position } from "@xyflow/react"

type MinimalNode = Omit<Node, "id" | "position"> & { width: number; height: number }

export function generateDiagram(nodes: MinimalNode[], width: number) {
  const layout = getDiagramLayout(width, nodes)

  return { nodes: positionNodes(nodes, layout), edges: generateEdges(nodes), height: layout.height }
}

function positionNodes(nodes: MinimalNode[], layout: DiagramLayout): Node[] {
  const { columns, marginY, yStep, rowHeights } = layout

  let accumulatedY = 0 // Used only for single-column layout

  return nodes.map((node, index) => {
    const row = Math.floor(index / columns) + 1
    const isReverseRow = row % 2 === 0
    const col = isReverseRow ? columns - (index % columns) : (index % columns) + 1

    function getX() {
      if (columns === 1 && !isReverseRow) return 12
      if (columns === 1 && isReverseRow) return layout.windowWidth - node.width - 12
      return (col - 1) * (node.width + layout.marginX) + (isReverseRow ? node.width / 2 : 0)
    }

    function getY() {
      if (columns === 1) {
        const y = accumulatedY
        accumulatedY += node.height + layout.marginY // increment for next node
        return y
      }
      const rowIndex = row - 1
      // Calculate baseY as sum of the maximum heights of all previous rows plus vertical margins
      const baseY =
        rowHeights.slice(0, rowIndex).reduce((acc, h) => acc + h, 0) + rowIndex * layout.marginY
      // Adjust using yStep per column; first column has no extra offset
      return baseY + (isReverseRow ? (columns - col) * yStep : (col - 1) * yStep)
    }

    return {
      ...node,
      id: `i${index + 1}`,
      position: {
        x: getX(),
        y: getY(),
      },
      data: {
        ...node.data,
        incomingPosition: getIncomingPosition(col, isReverseRow, columns),
        outcomingPosition: getOutComingPosition(col, isReverseRow),
        disableMetricsWarning: node.data.disableMetricsWarning,
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

function getIncomingPosition(col: number, isReverseRow: boolean, columns: number) {
  const isFirstInRow = isReverseRow ? col === columns : col === 1
  if (isFirstInRow) return isReverseRow ? ("top" as Position.Top) : ("top" as Position.Left)
  return isReverseRow ? ("right" as Position.Right) : ("left" as Position.Left)
}

function getOutComingPosition(col: number, isReverseRow: boolean) {
  // const isLastInRow = isReverseRow ? col === 1 : col === COLUMNS
  // if (isLastInRow) return isReverseRow ? ("bottom" as Position.Bottom) : ("right" as Position.Right)
  return isReverseRow ? ("left" as Position.Left) : ("right" as Position.Right)
}

type DiagramLayout = ReturnType<typeof getDiagramLayout>

function getDiagramLayout(width: number, nodes: MinimalNode[]) {
  const columns = getColumnsCount(width)
  const rows = Math.ceil(nodes.length / columns)

  const marginX = width < 768 ? 16 : 56
  const marginY = width < 768 ? 80 : 200
  const yStep = width < 768 ? 0 : 25

  // Compute maximum height for each row
  const rowHeights = Array.from({ length: rows }, (_, rowIndex) => {
    const rowNodes = nodes.slice(rowIndex * columns, (rowIndex + 1) * columns)
    return Math.max(...rowNodes.map((node) => node.height))
  })

  const totalRowsHeight = rowHeights.reduce((acc, h) => acc + h, 0)
  let height = totalRowsHeight + (rows - 1) * marginY + (rows - 1) * (columns * yStep)

  // Patch: For one-row diagrams, adjust the height to ensure the bottom of the lowest node is visible.
  if (rows === 1) {
    height = nodes.reduce((max, node, i) => {
      const col = (i % columns) + 1
      const nodeBottom = (col - 1) * yStep + node.height
      return Math.max(max, nodeBottom)
    }, 0)
  }

  return { columns, rows, marginX, marginY, yStep, height, windowWidth: width, rowHeights }
}

function getColumnsCount(width: number) {
  if (width < 768) return 1
  if (width < 1280) return 2
  if (width < 1512) return 3
  return 4
}
