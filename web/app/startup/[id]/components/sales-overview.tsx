import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MonthlySales } from "@/lib/shopify/summary"
import { BringRevenueOnchain } from "./bring-revenue-onchain"
import { SalesChart } from "./sales-chart"
import { combineMonthlySalesWithTokenPayments } from "@/lib/onchain-startup/revenue-data"
import { EmptyState } from "@/components/ui/empty-state"
import { Startup } from "@/lib/onchain-startup/startup"

interface Props {
  monthlySales: MonthlySales[]
  tokenPayments: {
    timestamp: number
    txnValue: string
    newlyIssuedTokenCount: string
  }[]
  startup: Startup
}

export async function SalesOverview(props: Props) {
  const { monthlySales, tokenPayments, startup } = props

  // Combine monthly sales with token payments on the server
  const combinedData = await combineMonthlySalesWithTokenPayments(monthlySales, tokenPayments)

  return (
    <Card className="flex h-full flex-col border border-border/40 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex w-full flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Revenue</CardTitle>
            <CardDescription className="mt-1 text-xs">Grows the network</CardDescription>
          </div>
          {startup.revnetProjectId && (
            <BringRevenueOnchain startup={startup} revnetProjectId={startup.revnetProjectId} />
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
