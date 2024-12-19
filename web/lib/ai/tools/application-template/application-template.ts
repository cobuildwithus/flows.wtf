import database, { getCacheStrategy } from "@/lib/database/edge"
import { meetsMinimumSalary } from "@/lib/database/helpers"
import { tool } from "ai"
import { z } from "zod"

export const getApplicationTemplate = tool({
  parameters: z.object({ flowId: z.string() }),
  description: "Get the application template for a specific flow",
  execute: async ({ flowId }) => {
    console.debug(`Getting the application template for flow ${flowId}`)
    return await getTemplateForFlow(flowId)
  },
})

export async function getTemplateForFlow(flowId: string | undefined) {
  if (!flowId) return null

  const flow = await database.grant.findFirstOrThrow({
    where: { id: flowId, isFlow: true },
    select: {
      derivedData: true,
      title: true,
      monthlyBaselinePoolFlowRate: true,
      activeRecipientCount: true,
      awaitingRecipientCount: true,
      challengedRecipientCount: true,
    },
    ...getCacheStrategy(1800),
  })

  if (!flow.derivedData?.template) return null

  const canPublishDrafts = meetsMinimumSalary(flow)

  return `### Application template for "${flow.title}" flow

  Here is the application template for flow with ID = ${flowId} in markdown format.
  
  ${flow.derivedData.template}

  ### Accepting new grants

  ${canPublishDrafts ? "In this flow there is still a room for new grants (there is enough budget). No need to inform user about it upfront - inform them if they ask specifally about it." : "This flow is currently not accepting new grants, because budget is full. You can still create new draft for user and submit it, just the user won't be able to publish it onchain until new spots open up. Do inform user about this fact before starting the application process. User can submit draft application, edit it later and just publish onchain when it will be possible again."}


  `
}
