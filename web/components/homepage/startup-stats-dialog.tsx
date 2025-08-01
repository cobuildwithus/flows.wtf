"use client"

import { ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useServerFunction } from "@/lib/hooks/use-server-function"
import { getStartupSalesData } from "@/lib/onchain-startup/startup-sales-data"
import type { StartupWithRevenue } from "./types"
import { DollarSign, ShoppingBag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SalesChart } from "@/app/startup/[id]/components/sales-chart"
import { OrdersTable } from "@/app/startup/[id]/components/orders-table"
import { ProductsTableClient } from "./products-table-client"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PercentChange } from "@/components/ui/percent-change"

interface Props {
  startup: StartupWithRevenue
  children: ReactNode
}

function StatCard({
  title,
  value,
  change,
  Icon,
}: {
  title: string
  value: ReactNode
  change?: number
  Icon: typeof DollarSign
}) {
  return (
    <Card className="border border-border/40 bg-card/80 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {change !== undefined && (
          <CardDescription className="mt-1.5 text-xs">
            <PercentChange value={change} className="text-xs" /> since last month
          </CardDescription>
        )}
      </CardContent>
    </Card>
  )
}

export function StartupStatsDialog({ startup, children }: Props) {
  const { data, error, isLoading } = useServerFunction(getStartupSalesData, "startup-sales-data", [
    startup.id,
  ])

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{startup.title} Revenue</DialogTitle>
        </DialogHeader>
        {isLoading && (
          <div className="space-y-4">
            <Skeleton height={80} />
            <Skeleton height={320} />
          </div>
        )}
        {error && <p className="text-destructive">Failed to load data</p>}
        {data && (
          <ScrollArea className="max-h-[80dvh] max-w-full pr-4">
            <div className="space-y-6 pb-4">
              {/* Metrics */}
              <div className="grid gap-4 md:grid-cols-2">
                <StatCard
                  title="Revenue"
                  value={`$${data.revenue.totalSales.toLocaleString()}`}
                  change={data.revenue.salesChange}
                  Icon={DollarSign}
                />
                <StatCard
                  title="Orders"
                  value={data.revenue.totalOrders.toLocaleString()}
                  change={data.revenue.ordersChange}
                  Icon={ShoppingBag}
                />
              </div>

              {/* Chart */}
              <SalesChart
                data={data.monthlySales.map((m) => ({ ...m, date: new Date(m.date) })) as any}
              />

              {/* Products */}
              {data.products.length > 0 && <ProductsTableClient products={data.products} />}

              {/* Orders */}
              {data.orders.length > 0 && (
                <OrdersTable orders={data.orders} products={data.products} />
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
