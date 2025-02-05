import database from "@/lib/database/edge"
import { ImpactBlock, ImpactUnit } from "./types"

export async function getImpactBlocks(grantId: string): Promise<ImpactBlock[]> {
  const stories = await database.story.findMany({
    // where: { grant_ids: { has: grantId } },
    orderBy: { updated_at: "desc" },
    take: 10,
  })

  return stories.map((story) => ({
    id: story.id,
    title: story.title,
    impactUnits: generateImpactUnits(Math.floor(Math.random() * 4) + 1),
  }))
}

function generateImpactUnits(count = 4): ImpactUnit[] {
  const sampleImpactUnits = [
    {
      date: "2024-03-01",
      name: "GitHub Stars",
      rationale: "Measure of project adoption and visibility",
      confidence: 95,
      sources: ["GitHub API"],
      unit: "stars",
      value: 1200,
    },
    {
      date: "2024-03-01",
      name: "Active Contributors",
      rationale: "Community engagement metric",
      confidence: 90,
      sources: ["GitHub API"],
      unit: "contributors",
      value: 25,
    },
    {
      date: "2024-03-01",
      name: "Workshop Participants",
      rationale: "Direct educational impact",
      confidence: 100,
      sources: ["Workshop Registration Data"],
      unit: "developers",
      value: 500,
    },
    {
      date: "2024-03-01",
      name: "Documentation Views",
      rationale: "Developer resource utilization",
      confidence: 98,
      sources: ["Analytics Data"],
      unit: "views",
      value: 25000,
    },
    {
      date: "2024-03-01",
      name: "Code Downloads",
      rationale: "Package adoption metric",
      confidence: 95,
      sources: ["NPM Stats", "GitHub Releases"],
      unit: "downloads",
      value: 50000,
    },
    {
      date: "2024-03-01",
      name: "Forum Posts",
      rationale: "Community engagement and support",
      confidence: 85,
      sources: ["Discord Data", "GitHub Discussions"],
      unit: "posts",
      value: 750,
    },
  ]

  return Array(count)
    .fill(null)
    .map(() => sampleImpactUnits[Math.floor(Math.random() * sampleImpactUnits.length)])
}
