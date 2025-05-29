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
              <BreadcrumbPage>{startup.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
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

      <div className="container mb-8 mt-4 flex">
        <Team members={teamMembers} user={user} startup={startup} />
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

        <SalesOverview
          monthlySales={salesSummary.monthlySales}
          startupTitle={startup.title}
          projectId={startup.revnetProjectIds.base}
        />

        <div className="max-sm:space-y-6 md:grid md:grid-cols-2 md:gap-6">
          <ProductsTable products={products} />

          <Suspense>
            <SocialProfiles usernames={startup.socialUsernames} />
          </Suspense>
        </div>

        <OrdersTable orders={orders} products={products} />
      </div>
    </>
  )
}
