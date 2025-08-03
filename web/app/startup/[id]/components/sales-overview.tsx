import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BringRevenueOnchain } from "./bring-revenue-onchain"
import { SalesChart } from "./sales-chart"
import { getSalesByMonth } from "@/lib/onchain-startup/sales-by-month"
import { EmptyState } from "@/components/ui/empty-state"
import { Startup } from "@/lib/onchain-startup/startup"
import { Order } from "@/lib/shopify/orders"

interface Props {
  tokenPayments: {
    timestamp: number
    txnValue: string
    newlyIssuedTokenCount: string
  }[]
  startup: Startup
  orders: Order[]
}

export async function SalesOverview(props: Props) {
  const { orders, tokenPayments, startup } = props

  // Combine monthly sales with token payments on the server
  const combinedData = await getSalesByMonth(orders, tokenPayments)

  return (
    <Card className="flex h-full flex-col border border-border/40 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex w-full flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Revenue</CardTitle>
            <CardDescription className="mt-1 text-xs">Grows the network</CardDescription>
          </div>
          {startup.jbxProjectId && (
            <BringRevenueOnchain startup={startup} revnetProjectId={startup.jbxProjectId} />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pb-4 pt-2">
        {combinedData.length > 0 ? (
          <SalesChart data={combinedData} />
        ) : (
          <div className="my-12 flex-1">
            <EmptyState
              size={100}
              title="No revenue"
              description="Check back later for updates."
              textSize="sm"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
