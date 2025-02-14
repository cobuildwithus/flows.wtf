import { Impact } from "@prisma/flows"

function getLayout(width: number, height: number): "vertical" | "horizontal" {
  const ratio = width / height
  return ratio >= 0.9 ? "horizontal" : "vertical"
}

export function generateImpactNodes(impacts: Impact[]) {
  return impacts.map((impact, index) => {
    const layout = getLayout(impact.bestImage?.width || 250, impact.bestImage?.height || 220)

    return {
      type: "impact",
      width: layout === "horizontal" ? 280 : 280,
      height: layout === "horizontal" ? 240 : 220,
      data: {
        impact,
        layout,
        hasPrevious: index > 0,
        hasNext: index < impacts.length - 1,
        previousId: index > 0 ? `i${index}` : undefined,
        nextId: index < impacts.length - 1 ? `i${index + 2}` : undefined,
      },
    }
  })
}
