import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MonthlySales } from "@/lib/shopify/summary"
import { BringRevenueOnchain } from "./bring-revenue-onchain"
import { SalesChart } from "./sales-chart"
import { combineMonthlySalesWithTokenPayments } from "@/lib/onchain-startup/sales-data"

interface Props {
  monthlySales: MonthlySales[]
  tokenPayments: {
    timestamp: number
    ethAmount: string | null
    newlyIssuedTokenCount: string
  }[]
  startupTitle: string
  projectId: bigint
  chainId: number
}

export async function SalesOverview(props: Props) {
  const { monthlySales, tokenPayments, startupTitle, projectId, chainId } = props

  // Combine monthly sales with token payments on the server
  const combinedData = await combineMonthlySalesWithTokenPayments(monthlySales, tokenPayments)

  return (
    <Card className="border border-border/40 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex w-full flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Revenue</CardTitle>
            <CardDescription className="mt-1 text-xs">Grows the network</CardDescription>
          </div>
          <BringRevenueOnchain
            startupTitle={startupTitle}
            projectId={projectId}
            chainId={chainId}
          />
        </div>
      </CardHeader>
      <CardContent className="pb-4 pt-2">
        <SalesChart data={combinedData} />
      </CardContent>
    </Card>
  )
}
