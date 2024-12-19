import "server-only"

import { Card, CardContent } from "@/components/ui/card"
import { Markdown } from "@/components/ui/markdown"
import { ScrollArea } from "@/components/ui/scroll-area"
import database from "@/lib/database/edge"
import { getFlow } from "@/lib/database/queries/flow"
import { countUserActiveGrants } from "@/lib/database/queries/grant"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { Metadata } from "next"
import { ApplyForm } from "../components/apply-form"

export const runtime = "nodejs"

interface Props {
  params: Promise<{ flowId: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const flow = await getFlow((await props.params).flowId)

  return {
    title: `Apply for a grant - ${flow.title}`,
    description: `Submit your grant application in ${flow.title} flow.`,
  }
}

export default async function ApplyFlowPage(props: Props) {
  const { flowId } = await props.params

  const flow = await database.grant.findFirstOrThrow({
    where: { id: flowId, isFlow: true, isActive: true },
    include: { derivedData: true },
  })

  const userActiveGrants = await countUserActiveGrants()

  return (
    <main className="container flex h-[calc(100vh-68px)] flex-col pb-12 pt-8">
      <h3 className="text-pretty font-semibold tracking-tight">
        {flow.isTopLevel ? "Suggest new flow" : `Apply for a grant in "${flow.title}"`}
      </h3>
      <p className="mt-1.5 max-w-screen-md whitespace-pre-line text-balance text-sm text-muted-foreground">
        {flow.isTopLevel
          ? "Suggest a new funding flow to help people make impact."
          : "Review guidelines below, outline your project, highlight its impact, and demonstrate how it meets the flow's requirements and objectives."}
      </p>
      <div className="mt-6 grid grow grid-cols-1 gap-8 lg:grid-cols-10">
        <Card className="flex grow flex-col lg:col-span-6">
          <CardContent className="flex grow flex-col">
            <ApplyForm
              flow={flow}
              isFlow={flow.isTopLevel}
              userActiveGrants={userActiveGrants}
              template={
                flow.isTopLevel
                  ? defaultFlowTemplate
                  : flow.derivedData?.template || defaultGrantTemplate
              }
            />
          </CardContent>
        </Card>

        <div className="flex flex-col max-sm:order-first lg:col-span-4">
          <div className="flex grow flex-col rounded-lg border border-dashed border-primary p-4 lg:p-5">
            <div className="flex items-center justify-between space-x-2">
              <h4 className="font-medium tracking-tight text-primary">Guidelines & requirements</h4>
              <ExclamationTriangleIcon className="size-6" />
            </div>
            <ScrollArea className="mt-6 h-[50vh] grow pr-4" type="always">
              <div className="space-y-4 text-sm leading-relaxed">
                <Markdown>{flow.description}</Markdown>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </main>
  )
}

const defaultGrantTemplate = `
### Overview
Briefly describe the problem your project aims to solve.

### Impact
- Describe the impact of your project.
- Be specific
- What does the world look like if your project is successful?

### Team
Introduce the key members of your team and their relevant experience.

### Additional Information
Include any other details that support your application.`

const defaultFlowTemplate = `
Short description of the flow idea and what is expected of builders.

### Payment Structure
- 
- 
- 

### How to Apply
- 
- 
- 

### Ongoing Requirements
- 
- 
- 

### How to Post Updates
- 
- 
- 

### How Your Work Gets Verified
- 
- 
- 

### How to Keep Your Funding
- 
- 
- 

### What Gets You Removed
- 
- 
- 

### For Curators
- 
- 
- 
`
