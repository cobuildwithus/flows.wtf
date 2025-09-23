import { formatCurrency } from "@/lib/erc20/super-token"
import { CustomFlow } from "./custom-flows"
import type { Grant } from "@prisma/flows"
import { getStartups } from "@/lib/onchain-startup/startup"
import { getTotalRevenue } from "@/lib/onchain-startup/get-total-revenue"
import { PercentChange } from "@/components/ui/percent-change"
import { fromWei } from "@/lib/utils"

interface Props {
  customFlow: CustomFlow
}

export async function getFlowStats(
  flow: any,
  relevantGrants: any[],
  flowId: string,
): Promise<
  { name: string; value: string | React.ReactNode; budgetDialog?: boolean; tooltip?: string }[]
> {
  if (flow.isAccelerator) {
    // For accelerators, get revenue data
    const startups = await getStartups(flowId)
    const revenue = await getTotalRevenue(startups)

    return [
      {
        name: "in revenue",
        value: Intl.NumberFormat("en", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(revenue.totalRevenue),
        tooltip: "Revnet token purchases and Shopify sales",
      },
      {
        name: "growth rate",
        value: <PercentChange value={revenue.salesChange} showColor={false} />,
        tooltip: "Month over month change in revenue",
      },
    ]
  } else {
    // For regular flows, use funding stats
    return [
      {
        name: "Paid out",
        value: formatCurrency(
          getSum(relevantGrants, "earned"),
          flow.underlyingTokenSymbol,
          flow.underlyingTokenPrefix,
        ),
        tooltip: "Total amount paid out to recipients",
      },
      {
        name: "Monthly funding",
        budgetDialog: true,
        value: formatCurrency(
          getSum(relevantGrants, "monthly"),
          flow.underlyingTokenSymbol,
          flow.underlyingTokenPrefix,
        ),
        tooltip: "Monthly funding rate for all recipients",
      },
    ]
  }
}

function getSum(
  flows: Pick<
    Grant,
    "activeRecipientCount" | "totalEarned" | "monthlyOutgoingFlowRate" | "monthlyIncomingFlowRate"
  >[],
  key: "earned" | "projects" | "monthly",
): number {
  return flows.reduce((sum, flow) => {
    switch (key) {
      case "earned":
        return sum + fromWei(flow.totalEarned)
      case "projects":
        return sum + flow.activeRecipientCount
      case "monthly":
        return (
          sum + (fromWei(flow.monthlyOutgoingFlowRate) || fromWei(flow.monthlyIncomingFlowRate))
        )
      default:
        return sum
    }
  }, 0)
}
