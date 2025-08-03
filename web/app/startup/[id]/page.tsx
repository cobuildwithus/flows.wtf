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
import { ImpactChain } from "@/app/item/[grantId]/impact/impact-chain"
import { canEditGrant } from "@/lib/database/helpers"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { AgentChatProvider } from "@/app/chat/components/agent-chat"
import { BgGradient } from "@/app/item/[grantId]/components/bg-gradient"
import { StartupHero } from "./components/startup-hero"

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ impactId?: string }>
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
  const { impactId } = await props.searchParams

  const startup = await getStartup(id)
  if (!startup) throw new Error("Startup not found")

  const shopify = startup.shopify

  const [teamMembers, user, orders, budgets, tokenPayments] = await Promise.all([
    getTeamMembers(startup.id),
    getUser(),
    shopify ? getAllOrders(shopify) : Promise.resolve([]),
    getStartupBudgets(startup.id),
    startup.revnetProjectId ? getTokenPayments(startup.revnetProjectId) : Promise.resolve([]),
  ])

  const [products, revenue, impacts] = await Promise.all([
    shopify ? getProducts(shopify, orders) : Promise.resolve([]),
    getRevenueChange(orders, tokenPayments),
    database.impact.findMany({
      where: { grantId: { in: budgets.map((b) => b.id) }, deletedAt: null },
      orderBy: [{ date: "desc" }, { updatedAt: "desc" }],
    }),
  ])

  const canEdit = canEditGrant(startup, user?.address)

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

      <StartupHero startup={startup} />

      <div className="container flex">
        <Team members={teamMembers} user={user} startup={startup} />
      </div>

      <div className="mt-8 space-y-6 pb-12">
        <div className="container">
          <div className="space-y-6 md:grid md:grid-cols-2 md:items-start md:gap-6 md:space-y-0">
            <div id="revenue" className="flex flex-col space-y-6 md:h-full">
              {/* <Mission startup={startup} /> */}
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
        </div>
        <div className="container grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

        {impacts.length > 0 && (
          <div id="progress" className="relative overflow-hidden">
            <BgGradient />
            <AgentChatProvider
              id={`grant-edit-${startup.id}-${user?.address}`}
              type="flo"
              user={user}
              data={{ grantId: startup.id }}
              identityToken={await getPrivyIdToken()}
              initialMessages={[]}
            >
              <Suspense fallback={<div className="h-[300px]" />}>
                <div className="my-12">
                  <ImpactChain impacts={impacts} canEdit={canEdit} impactId={impactId} />
                </div>
              </Suspense>
            </AgentChatProvider>
          </div>
        )}

        <div className="container max-sm:space-y-6 md:grid md:grid-cols-2 md:gap-6">
          <ProductsTable products={products} shopifyUrl={shopify?.url} />

          <div className="space-y-6">
            <Suspense fallback={<Skeleton height={300} />}>
              <StartupActivity flowIds={budgets.map((b) => b.id)} />
            </Suspense>

            <Suspense>
              {startup.socialUsernames && <SocialProfiles usernames={startup.socialUsernames} />}
            </Suspense>
          </div>
        </div>

        {orders.length > 0 && (
          <div className="container">
            <OrdersTable orders={orders} products={products} />
          </div>
        )}
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
