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
import { getTokenPayments } from "@/lib/onchain-startup/token-payments"
import { getAllOrders } from "@/lib/shopify/orders"
import { getProducts } from "@/lib/shopify/products"
import { getSalesSummary } from "@/lib/shopify/summary"
import { getIpfsUrl } from "@/lib/utils"
import { Banknote, DollarSign, Repeat, ShoppingBag } from "lucide-react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { MetricCard } from "./components/metric-card"
import { Mission } from "./components/mission"
import { MoneyFlowDiagram } from "./components/money-flow-diagram"
import { OrdersTable } from "./components/orders-table"
import { ProductsTable } from "./components/products-table"
import { SalesOverview } from "./components/sales-overview"
import { SocialProfiles } from "./components/social-profiles"
import { Team } from "./components/team"
import { Timeline } from "./components/timeline/timeline"
import { getStartupBudgets } from "@/lib/onchain-startup/budgets"
import { getCombinedSalesMetrics } from "@/lib/onchain-startup/sales-metrics"

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

  const [teamMembers, user, impactFlow, orders, budgets, tokenPayments] = await Promise.all([
    getTeamMembers(startup.id),
    getUser(),
    database.grant.findFirstOrThrow({
      where: { isActive: true, id: startup.impactFlowId },
      select: {
        id: true,
        monthlyOutgoingFlowRate: true,
        title: true,
        image: true,
        tagline: true,
        subgrants: { select: { id: true, title: true, image: true } },
      },
    }),
    getAllOrders(startup.shopify),
    getStartupBudgets(startup.id),
    getTokenPayments(Number(startup.revnetProjectIds.base)),
  ])

  const [products, salesSummary] = await Promise.all([
    getProducts(startup.shopify, orders),
    getSalesSummary(orders),
  ])

  // Get combined sales metrics including token payments
  const combinedMetrics = await getCombinedSalesMetrics(salesSummary.monthlySales, tokenPayments)

  const totalBudget = budgets
    .map((b) => Number(b.monthlyIncomingFlowRate))
    .reduce((a, b) => a + b, 0)
  const totalFunded = budgets.map((b) => Number(b.totalEarned)).reduce((a, b) => a + b, 0)

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
              <BreadcrumbLink href={`/${startup.acceleratorId}`}>
                {startup.flow.title}
              </BreadcrumbLink>
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
          totalBudget={totalBudget}
          impactGrants={{
            grants: impactFlow.subgrants,
            monthlyFlowRate: Number(impactFlow.monthlyOutgoingFlowRate),
            flowId: impactFlow.id,
          }}
        />
      </div>

      <div className="container flex">
        <Team members={teamMembers} user={user} startup={startup} />
      </div>

      <div className="container mt-8 space-y-6 pb-12">
        <div className="max-sm:space-y-6 md:grid md:grid-cols-2 md:gap-6">
          <div className="flex flex-col space-y-6">
            <Mission startup={startup} />
            <Suspense fallback={<div className="h-[450px] animate-pulse rounded-lg bg-muted" />}>
              <SalesOverview
                monthlySales={salesSummary.monthlySales}
                tokenPayments={tokenPayments}
                startupTitle={startup.title}
                projectId={startup.revnetProjectIds.base}
                chainId={startup.chainId}
              />
            </Suspense>
          </div>

          <Timeline orders={orders.slice(0, 30)} startup={startup} teamMembers={teamMembers} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Sales Volume"
            value={`$${combinedMetrics.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            change={combinedMetrics.salesChange}
          />
          <MetricCard
            title="Total Orders"
            value={combinedMetrics.totalOrders.toLocaleString()}
            icon={ShoppingBag}
            change={combinedMetrics.ordersChange}
          />

          <MetricCard
            title="Budget"
            value={
              <>
                <Currency>{totalBudget}</Currency>
                /mo
              </>
            }
            icon={Repeat}
          />

          <MetricCard
            title={`Funding from ${startup.accelerator.name}`}
            value={<AnimatedSalary value={totalFunded} monthlyRate={totalBudget} />}
            icon={Banknote}
          />
        </div>

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
