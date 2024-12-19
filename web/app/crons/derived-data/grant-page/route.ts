import "server-only"

import { generateGrantPageData } from "@/app/item/[grantId]/page-data/generate"
import database from "@/lib/database/edge"
import { NextResponse } from "next/server"

export const maxDuration = 300

export async function GET() {
  try {
    const grants = await database.grant.findMany({
      where: {
        isFlow: false,
        OR: [{ derivedData: null }, { derivedData: { pageData: null } }],
      },
      take: 3,
    })

    for (const grant of grants) {
      const data = await generateAndStoreGrantPageData(grant.id)
      if (!data) throw new Error(`Failed to generate page data for ${grant.title}`)

      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    return NextResponse.json({ success: true, grants: grants.map((g) => g.title) })
  } catch (error: any) {
    console.error(error)
    return new Response(error.message, { status: 500 })
  }
}

async function generateAndStoreGrantPageData(grantId: string) {
  const data = await generateGrantPageData(grantId)
  if (!data) throw new Error("Failed to generate grant page data")

  const pageData = JSON.stringify(data)

  const hasDerivedData = await database.derivedData.count({ where: { grantId } })

  if (hasDerivedData > 0) {
    await database.derivedData.update({ where: { grantId }, data: { pageData } })
  } else {
    await database.derivedData.create({ data: { grantId, pageData } })
  }

  console.debug(`Stored page data for ${data.title} in the DB`)
  return data
}
