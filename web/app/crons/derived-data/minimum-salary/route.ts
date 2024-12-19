import "server-only"

import database from "@/lib/database/edge"
import { NextResponse } from "next/server"
import { generateMinimumSalary } from "./generate-minimum-salary"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const maxDuration = 300

export async function GET() {
  try {
    const flows = await database.grant.findMany({
      where: {
        isFlow: true,
        isTopLevel: false,
        OR: [{ derivedData: { minimumSalary: null } }, { derivedData: null }],
      },
      select: { id: true, description: true, derivedData: true },
    })

    for (const flow of flows.filter((flow) => !flow.derivedData?.minimumSalary)) {
      const { minimumSalary } = await generateMinimumSalary(flow.description)
      console.debug({ description: flow.description, minimumSalary })
      await database.derivedData.upsert({
        where: { grantId: flow.id },
        update: { minimumSalary: parseInt(minimumSalary), updatedAt: new Date() },
        create: {
          minimumSalary: parseInt(minimumSalary),
          grantId: flow.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    return NextResponse.json({ success: true, generatedMinimumSalaries: flows.length })
  } catch (error: any) {
    console.error(error)
    return new Response(error.message, { status: 500 })
  }
}
