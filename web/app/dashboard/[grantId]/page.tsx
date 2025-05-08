import { Builder } from "@/app/item/[grantId]/cards/builder"
import { DeliverablesCard } from "@/app/item/[grantId]/cards/deliverables"
import { MissionCard } from "@/app/item/[grantId]/cards/mission"
import { getGrant } from "@/app/item/[grantId]/get-grant"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getUser } from "@/lib/auth/user"
import { canEditGrant } from "@/lib/database/helpers"
import { getIpfsUrl } from "@/lib/utils"
import { DollarSign, RefreshCw, ShoppingBag, Users } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import { notFound, redirect } from "next/navigation"
import { MetricCard } from "./components/metric-card"
import { PageVisits } from "./components/page-visits"
import { ProductsTable } from "./components/products-table"
import { SalesOverview } from "./components/sales-overview"
import { SalesTable } from "./components/sales-table"
import { SocialMediaMetrics } from "./components/social-media-metrics"

interface Props {
  params: Promise<{ grantId: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { grantId } = await props.params

  const grant = await getGrant(grantId)
  if (!grant.derivedData) notFound()

  const { title, tagline, coverImage } = grant.derivedData

  return {
    title,
    description: tagline,
    openGraph: { images: [getIpfsUrl(coverImage || grant.image, "pinata")] },
  }
}

export default async function GrantPage(props: Props) {
  const { grantId } = await props.params

  const [user, { flow, ...grant }] = await Promise.all([getUser(), getGrant(grantId)])

  if (grant.isFlow) return redirect(`/flow/${grant.id}/about`)
  if (!grant.derivedData) notFound()

  const { mission, builder, title, tagline, coverImage, gradients, deliverables } =
    grant.derivedData

  const canEdit = canEditGrant(grant, user?.address)

  // if (!grant.isOnchainStartup) {
  //   return redirect(`/item/${grant.id}`)
  // }

  return (
    <>
      <div className="mt-2.5 md:mt-6">
        <div className="container">
          <div className="md:flex md:items-center md:justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Flows</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/flow/${flow.id}`}>{flow.title}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="max-sm:hidden" />
                <BreadcrumbItem className="max-sm:hidden">
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {builder && (
              <Builder
                bio={builder.bio}
                links={builder.links}
                recipient={grant.recipient as `0x${string}`}
              />
            )}
          </div>

          <div className="mt-3 grid grid-cols-12 gap-x-2 gap-y-4 lg:gap-x-4">
            {title && coverImage && tagline && (
              <div className="relative col-span-full lg:col-span-7">
                <div className="relative h-full overflow-hidden rounded-xl">
                  <Image
                    src={getIpfsUrl(coverImage, "pinata")}
                    alt={title}
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent via-30% to-black/75" />
                  <div className="absolute bottom-0 p-5 lg:p-6">
                    <h1 className="text-balance text-xl font-bold text-white lg:text-3xl">
                      {title}
                    </h1>
                    <p className="mt-2 hidden text-pretty text-base text-white/80 sm:block lg:text-lg">
                      {tagline}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="col-span-full grid grid-cols-1 gap-x-3 gap-y-4 lg:col-span-5 lg:grid-cols-2 lg:gap-x-4">
              {gradients && mission && <MissionCard gradient={gradients.mission} text={mission} />}

              {deliverables && gradients && (
                <DeliverablesCard gradient={gradients?.deliverables} deliverables={deliverables} />
              )}
            </div>

            {/* <Stat label="Budget" className="">
              <Currency>{grant.monthlyIncomingFlowRate}</Currency>/mo
            </Stat>

            <Stat label="Total Earned">
              <AnimatedSalary
                value={grant.totalEarned}
                monthlyRate={grant.monthlyIncomingFlowRate}
              />
            </Stat> */}
          </div>
        </div>
      </div>
      <div className="container mt-6 space-y-6 pb-12">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Sales Total" value="$24,567.89" change={20.1} icon={DollarSign} />
          <MetricCard title="Total Orders" value="1,234" change={12.5} icon={ShoppingBag} />
          <MetricCard title="Unique Clients" value="892" change={7.2} icon={Users} />
          <MetricCard title="Returning Clients" value="42%" change={3.1} icon={RefreshCw} />
        </div>

        <div className="grid gap-6">
          <SalesOverview />
        </div>

        <div className="grid gap-6">
          <SalesTable />
        </div>

        <div className="grid gap-6">
          <ProductsTable />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <SocialMediaMetrics />
          <PageVisits />
        </div>
      </div>
    </>
  )
}
