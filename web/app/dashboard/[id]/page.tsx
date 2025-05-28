import { DeliverablesCard } from "@/app/item/[grantId]/cards/deliverables"
import { MissionCard } from "@/app/item/[grantId]/cards/mission"
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
import { getUser } from "@/lib/auth/user"
import database from "@/lib/database/flows-db"
import { getStartup } from "@/lib/onchain-startup/startup"
import { getTeamMembers } from "@/lib/onchain-startup/team-members"
import { getAllOrders } from "@/lib/shopify/orders"
import { getProducts } from "@/lib/shopify/products"
import { getSalesSummary } from "@/lib/shopify/summary"
import { getIpfsUrl } from "@/lib/utils"
import { Banknote, DollarSign, Repeat, ShoppingBag } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import { Suspense } from "react"
import { MetricCard } from "./components/metric-card"
import { MoneyFlowDiagram } from "./components/money-flow-diagram"
import { OrdersTable } from "./components/orders-table"
import { ProductsTable } from "./components/products-table"
import { SalesOverview } from "./components/sales-overview"
import { SocialProfiles } from "./components/social-profiles"
import { Team } from "./components/team"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params

  const startup = await getStartup(id)

  return {
    title: startup.title,
    description: startup.tagline,
    openGraph: { images: [getIpfsUrl(startup.image, "pinata")] },
  }
}

export default async function GrantPage(props: Props) {
  const { id } = await props.params

  const startup = await getStartup(id)
  if (!startup) throw new Error("Startup not found")

  const [teamMembers, user, supports, orders] = await Promise.all([
    getTeamMembers(startup.id, startup.allocator),
    getUser(),
    database.grant.findMany({
      where: { isActive: true, id: { in: startup.supports } },
      select: { id: true, title: true, image: true, tagline: true },
    }),
    getAllOrders(startup.shopify),
  ])

  const [products, salesSummary] = await Promise.all([
    getProducts(startup.shopify, orders),
    getSalesSummary(orders),
  ])

  const thisMonth = salesSummary.monthlySales[0]
  const lastMonth = salesSummary.monthlySales[1]

  const salesChange = thisMonth && lastMonth ? thisMonth.sales - lastMonth.sales : 0
  const ordersChange = thisMonth && lastMonth ? thisMonth.orders - lastMonth.orders : 0

  const { title, image, tagline, gradients, mission, deliverables } = startup

  return (
    <>
      <div className="container mt-2.5 md:mt-6 md:flex md:items-center md:justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Flows</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${startup.accelerator}`}>{startup.flow.title}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="max-sm:hidden" />
            <BreadcrumbItem className="max-sm:hidden">
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="container mt-3 grid grid-cols-12 gap-x-2 gap-y-4 lg:gap-x-4">
        <div className="relative col-span-full lg:col-span-8">
          <div className="relative h-full min-h-56 overflow-hidden rounded-xl">
            <Image
              src={getIpfsUrl(image, "pinata")}
              alt={title}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-40% to-black/75" />
            <div className="absolute bottom-0 p-5">
              <h1 className="text-balance text-xl font-bold text-white lg:text-3xl">{title}</h1>
              <p className="mt-1 hidden text-pretty text-base text-white/80 sm:block lg:text-lg">
                {tagline}
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-full grid grid-cols-1 gap-x-3 gap-y-4 lg:col-span-4 lg:gap-x-4">
          {gradients && mission && <MissionCard gradient={gradients.mission} text={mission} />}
        </div>
      </div>

      <div className="container mb-2 mt-4 flex">
        <Team members={teamMembers} user={user} startup={startup} />
      </div>

      <div className="container">
        <MoneyFlowDiagram
          products={products}
          members={teamMembers}
          user={user}
          startup={startup}
          supports={supports}
        />
      </div>

      <div className="container space-y-6 pb-12">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Sales Volume"
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
                <Currency>{startup.monthlyIncomingFlowRate}</Currency>/mo
              </>
            }
            icon={Repeat}
          />

          <MetricCard
            title="Funding from Vrbs"
            value={
              <AnimatedSalary
                value={startup.totalEarned}
                monthlyRate={startup.monthlyIncomingFlowRate}
              />
            }
            icon={Banknote}
          />
        </div>

        <div className="max-sm:space-y-6 md:grid md:grid-cols-2 md:gap-6">
          <ProductsTable products={products} />

          <Suspense>
            <SocialProfiles usernames={startup.socialUsernames} />
          </Suspense>
        </div>

        <SalesOverview monthlySales={salesSummary.monthlySales} />

        <OrdersTable orders={orders} products={products} />
      </div>
    </>
  )
}
