import "server-only"

import database from "@/lib/database/edge"
import { NextResponse } from "next/server"
import { generateTemplate } from "./generate-template"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const maxDuration = 300

export async function GET() {
  try {
    const flows = await database.grant.findMany({
      where: {
        isFlow: true,
        isTopLevel: false,
        OR: [{ derivedData: null }, { derivedData: { template: null } }],
      },
    })

    for (const flow of flows) {
      const { template } = await generateTemplate(flow.title, flow.description)
      console.debug({ title: flow.title, template })
      await database.derivedData.upsert({
        where: { grantId: flow.id },
        update: { template, updatedAt: new Date() },
        create: {
          template,
          grantId: flow.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })

      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    return NextResponse.json({ success: true, generatedTemplates: flows.length })
  } catch (error: any) {
    console.error(error)
    return new Response(error.message, { status: 500 })
  }
}
