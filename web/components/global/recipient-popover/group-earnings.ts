import { Grant } from "@/lib/database/types"
import { Prisma } from "@prisma/flows"
import { fromWei } from "@/lib/utils"

type GrantWithFlow = {
  monthlyIncomingFlowRate: string | number | Prisma.Decimal
  flow: Pick<
    Grant,
    | "underlyingTokenSymbol"
    | "underlyingTokenPrefix"
    | "underlyingERC20Token"
    | "underlyingTokenDecimals"
  >
}

function groupGrantsByCurrency(grants: GrantWithFlow[]) {
  const currencyGroups = grants.reduce(
    (acc, grant) => {
      const key = grant.flow.underlyingERC20Token || "ETH"

      if (!acc[key]) {
        acc[key] = {
          symbol: grant.flow.underlyingTokenSymbol || "ETH",
          prefix: grant.flow.underlyingTokenPrefix,
          yearlyEarnings: 0,
        }
      }

      acc[key].yearlyEarnings += fromWei(grant.monthlyIncomingFlowRate, 18) * 12

      return acc
    },
    {} as Record<string, { symbol: string; prefix?: string; yearlyEarnings: number }>,
  )

  const groups = Object.entries(currencyGroups)
    .filter(([, group]) => group.yearlyEarnings > 0)
    .sort(([, a], [, b]) => b.yearlyEarnings - a.yearlyEarnings)
    .map(([, group]) => ({
      symbol: group.symbol,
      prefix: group.prefix,
      yearlyEarnings: group.yearlyEarnings,
    }))

  return groups
}

export function formatEarningsList(grants: GrantWithFlow[]) {
  const currencyGroups = groupGrantsByCurrency(grants)
  if (currencyGroups.length === 0) return "No earnings"

  const formatted = currencyGroups.map((group) => {
    const amount = group.yearlyEarnings
    const formattedAmount =
      amount >= 1000000
        ? `${(amount / 1000000).toFixed(1)}M`
        : amount >= 1000
          ? `${(amount / 1000).toFixed(1)}k`
          : amount.toFixed(amount < 0.01 ? 4 : 2)

    return group.prefix ? `${group.prefix}${formattedAmount}` : `${formattedAmount} ${group.symbol}`
  })

  if (formatted.length === 1) return `Earning ${formatted[0]}`
  if (formatted.length === 2) return `Earning ${formatted[0]} and ${formatted[1]}`

  const last = formatted.pop()
  return `Earning ${formatted.join(", ")}, and ${last} per year.`
}

export function getDominantCurrency(grants: GrantWithFlow[]) {
  const currencyGroups = groupGrantsByCurrency(grants)

  if (currencyGroups.length === 1) {
    return {
      underlyingTokenSymbol: currencyGroups[0].symbol,
      underlyingTokenPrefix: currencyGroups[0].prefix,
    }
  }

  return null
}
