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
import { calculateTotalBudget } from "@/lib/grant-utils"
import { getRevenueChange } from "@/lib/onchain-startup/revenue-change"
import { StartupActivity } from "./components/startup-activity"
import { Skeleton } from "@/components/ui/skeleton"

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

  const shopify = startup.shopify
  const impactFlowId = startup.impactFlowId

  const [teamMembers, user, impactFlow, orders, budgets, tokenPayments] = await Promise.all([
    getTeamMembers(startup.id),
    getUser(),
    impactFlowId ? getImpactFlow(impactFlowId) : Promise.resolve(null),
    shopify ? getAllOrders(shopify) : Promise.resolve([]),
    getStartupBudgets(startup.id),
    startup.revnetProjectId ? getTokenPayments(startup.revnetProjectId) : Promise.resolve([]),
  ])

  const [products, revenue] = await Promise.all([
    shopify ? getProducts(shopify, orders) : Promise.resolve([]),
    getRevenueChange(orders, tokenPayments),
  ])

  const totalBudget = calculateTotalBudget(budgets)
  const totalFunded = budgets.map((b) => Number(b.totalEarned)).reduce((a, b) => a + b, 0)

  return (
    <>
      <div className="container mt-2.5 md:mt-6 md:flex md:items-center md:justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Flows</BreadcrumbLink>
            </BreadcrumbItem>
            {/* <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/flow/${startup.flow.id}`}>
                {startup.flow.title}
              </BreadcrumbLink>
            </BreadcrumbItem> */}
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
          revenue={revenue}
          user={user}
          startup={startup}
          totalBudget={totalBudget}
          impactGrants={{
            grants: impactFlow?.subgrants ?? [],
            monthlyFlowRate: Number(impactFlow?.monthlyOutgoingFlowRate ?? 0),
            flowId: impactFlow?.id ?? "",
          }}
        />
      </div>

      <div className="container flex">
        <Team members={teamMembers} user={user} startup={startup} />
      </div>

      <div className="container mt-8 space-y-6 pb-12">
        <div className="space-y-6 md:grid md:grid-cols-2 md:items-start md:gap-6 md:space-y-0">
          <div className="flex flex-col space-y-6 md:h-full">
            <Mission startup={startup} />
            <div className="flex-1">
              <Suspense fallback={<Skeleton height={450} />}>
                <SalesOverview orders={orders} tokenPayments={tokenPayments} startup={startup} />
              </Suspense>
            </div>
          </div>

          <Suspense fallback={<Skeleton height={450} />}>
            <Timeline orders={orders.slice(0, 30)} startup={startup} teamMembers={teamMembers} />
          </Suspense>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Revenue"
            value={`$${revenue.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            change={revenue.salesChange}
          />
          <MetricCard
            title="Orders"
            value={revenue.totalOrders.toLocaleString()}
            icon={ShoppingBag}
            change={revenue.ordersChange}
          />

          <MetricCard
            title="Budget"
            value={
              <>
                <Currency display={startup}>{totalBudget}</Currency>
                /mo
              </>
            }
            icon={Repeat}
          />

          <MetricCard
            title="Seed funding"
            value={<AnimatedSalary value={totalFunded} monthlyRate={totalBudget} />}
            icon={Banknote}
          />
        </div>
        <div className="max-sm:space-y-6 md:grid md:grid-cols-2 md:gap-6">
          <ProductsTable products={products} />

          <div className="space-y-6">
            <Suspense fallback={<Skeleton height={300} />}>
              <StartupActivity
                flowIds={budgets.map((b) => b.id)}
                launchDate={new Date((startup.activatedAt ?? 0) * 1000)}
              />
            </Suspense>

            <Suspense>
              {startup.socialUsernames && <SocialProfiles usernames={startup.socialUsernames} />}
            </Suspense>
          </div>
        </div>

        {orders.length > 0 && <OrdersTable orders={orders} products={products} />}
      </div>
    </>
  )
}

async function getImpactFlow(impactFlowId: string) {
  return database.grant.findFirst({
    where: { id: impactFlowId },
    select: {
      id: true,
      monthlyOutgoingFlowRate: true,
      title: true,
      image: true,
      tagline: true,
      subgrants: { select: { id: true, title: true, image: true } },
    },
  })
}
