import { Builder } from "@/app/item/[grantId]/cards/builder"
import { DeliverablesCard } from "@/app/item/[grantId]/cards/deliverables"
import { MissionCard } from "@/app/item/[grantId]/cards/mission"
import { getGrant } from "@/app/item/[grantId]/get-grant"
import { AnimatedSalary } from "@/components/global/animated-salary"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Currency } from "@/components/ui/currency"
import { getUserProfile } from "@/components/user-profile/get-user-profile"
import { getUser } from "@/lib/auth/user"
import database from "@/lib/database/edge"
import { canEditGrant } from "@/lib/database/helpers"
import { getAllOrders } from "@/lib/shopify/orders"
import { getProducts } from "@/lib/shopify/products"
import { getSalesSummary } from "@/lib/shopify/summary"
import { getIpfsUrl } from "@/lib/utils"
import { Banknote, DollarSign, Repeat, ShoppingBag } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { MetricCard } from "./components/metric-card"
import { MoneyFlowDiagram } from "./components/money-flow-diagram"
import { OrdersTable } from "./components/orders-table"
import { ProductsTable } from "./components/products-table"
import { SalesOverview } from "./components/sales-overview"
import { SocialProfiles } from "./components/social-profiles"
import { Team } from "./components/team"

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

  // ToDo: Add real team profiles
  const profiles = await Promise.all([
    getUserProfile("0x10c9A060e009a081bD82D9bf96BB09051E772F2d" as `0x${string}`),
    getUserProfile(grant.recipient as `0x${string}`),
    getUserProfile("0x289715fFBB2f4b482e2917D2f183FeAb564ec84F" as `0x${string}`),
    getUserProfile("0x2830e21792019CE670fBc548AacB004b08c7f71f" as `0x${string}`),
  ])

  // ToDo: Add real grants
  const supports = await database.grant.findMany({
    where: {
      isActive: true,
      isFlow: false,
      parentContract: "0x5a433ebbcc42c3ffe9e8fcd232e14293076e6012",
    },
    select: { id: true, title: true, image: true, tagline: true },
    take: 2,
    orderBy: { totalEarned: "desc" },
  })

  const reviews = [
    {
      url: "https://warpcast.com/rocketman/0x136e36aa",
      image:
        "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/cc70cf70-395c-4937-cfca-15618fe0d900/original",
    },
    {
      url: "https://warpcast.com/coolbeans1r.eth/0x5ef9a347",
      image:
        "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/1c6f7f8b-a8c2-49d0-14ca-3b434c0aed00/original",
    },
    {
      url: "https://warpcast.com/rocketman/0x139bb055",
      image:
        "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/a85b8da4-b246-4ae2-175c-e14539c46500/original",
    },
    {
      url: "https://warpcast.com/coolbeans1r.eth/0x64ad0e4e",
      image:
        "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/5e973b20-0817-4da4-2c35-2ca29e89d000/original",
    },
  ]

  // ToDo: Make store dynamic
  const orders = await getAllOrders("vrbs-coffee")
  const products = await getProducts("vrbs-coffee", orders)
  const salesSummary = await getSalesSummary(orders)

  const thisMonth = salesSummary.monthlySales[0]
  const lastMonth = salesSummary.monthlySales[1]

  const salesChange = thisMonth && lastMonth ? thisMonth.sales - lastMonth.sales : 0
  const ordersChange = thisMonth && lastMonth ? thisMonth.orders - lastMonth.orders : 0

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
          </div>

          <div className="col-span-full">
            <MoneyFlowDiagram
              products={products}
              profiles={profiles}
              user={user}
              grant={grant}
              supports={supports}
              reviews={reviews}
            />
          </div>
        </div>
      </div>
      <div className="container space-y-6 pb-12">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Sales Total"
            value={`$${salesSummary.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            change={salesChange}
          />
          <MetricCard
            title="Total Orders"
            value={salesSummary.totalOrders.toLocaleString()}
            icon={ShoppingBag}
            change={ordersChange}
          />

          <MetricCard
            title="Budget"
            value={
              <>
                <Currency>{grant.monthlyIncomingFlowRate}</Currency>/mo
              </>
            }
            icon={Repeat}
          />

          <MetricCard
            title="Total Earned"
            value={
              <AnimatedSalary
                value={grant.totalEarned}
                monthlyRate={grant.monthlyIncomingFlowRate}
              />
            }
            icon={Banknote}
          />
        </div>

        <SalesOverview monthlySales={salesSummary.monthlySales} />

        <OrdersTable orders={orders} products={products} />

        <ProductsTable products={products} />

        <div className="grid gap-6 md:grid-cols-2">
          <Suspense>
            <SocialProfiles
              usernames={{
                x: "vrbscoffee",
                instagram: "vrbscoffee",
                tiktok: "vrbscoffee",
                farcasterChannel: "vrbscoffee",
              }}
            />
          </Suspense>
          <Team profiles={profiles} />
        </div>
      </div>
    </>
  )
}
