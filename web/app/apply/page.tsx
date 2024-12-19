import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Currency } from "@/components/ui/currency"
import database from "@/lib/database/edge"
import { getPool } from "@/lib/database/queries/pool"
import { getIpfsUrl } from "@/lib/utils"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export async function generateMetadata(): Promise<Metadata> {
  const pool = await getPool()

  return {
    title: `Apply for a grant - ${pool.title}`,
    description: `Start grant application in ${pool.title} by selecting a flow.`,
  }
}

export default async function ApplyPage() {
  const flows = await database.grant.findMany({
    where: { isFlow: true, isActive: true, isTopLevel: false },
    orderBy: [{ title: "asc" }],
  })

  const pool = await getPool()

  return (
    <div className="container relative isolate mt-8 pb-12 pt-4 md:pt-12">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -z-10 transform-gpu overflow-hidden blur-3xl"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="mx-auto aspect-[1155/678] w-[1155px] bg-gradient-to-tr from-secondary/20 to-primary/25"
        />
      </div>
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-base font-semibold text-primary">Earn a salary with Nouns</h2>
        <p className="mt-2.5 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          Apply for a grant
        </p>
      </div>
      <p className="mx-auto mt-4 max-w-2xl text-pretty text-center text-sm text-muted-foreground md:mt-6 lg:text-lg">
        Start your grant application by selecting the flow that best fits your project. Each flow
        has a specific focus and budget.
      </p>
      <div className="mx-auto mt-10 max-w-screen-lg md:mt-16">
        {flows.length === 0 && (
          <div className="flex items-center justify-center">
            <Alert variant="destructive">
              <ExclamationTriangleIcon className="size-4" />
              <AlertTitle>No flows found</AlertTitle>
              <AlertDescription>There are no flows available for you to apply to.</AlertDescription>
            </Alert>
          </div>
        )}

        {flows.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 lg:gap-5">
            {flows.map((flow) => (
              <Link
                href={`/apply/${flow.id}`}
                key={flow.id}
                className="group h-full transition-transform md:hover:-translate-y-2"
              >
                <Card className="h-full bg-card/75 dark:bg-transparent">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center">
                      <Image
                        src={getIpfsUrl(flow.image)}
                        alt={flow.title}
                        width={64}
                        height={64}
                        className="mb-4 size-10 rounded-full object-cover lg:size-16"
                      />

                      <h3 className="mt-0.5 text-center text-sm font-medium transition-colors group-hover:text-primary lg:text-lg">
                        {flow.title}
                      </h3>
                      <p className="mb-2 text-center text-xs text-muted-foreground lg:text-sm">
                        {flow.tagline}
                      </p>
                      <Badge className="mt-2">
                        <Currency>{Number(flow.monthlyIncomingFlowRate)}</Currency>
                        /mo
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="mx-auto mt-16 max-w-screen-lg text-center text-sm text-muted-foreground">
        Not seeing the flow you want? <br className="md:hidden" />
        <Link
          href={`/apply/${pool.id}/manual`}
          className="text-primary underline hover:text-primary/80"
        >
          Create a new one
        </Link>
      </div>
    </div>
  )
}
