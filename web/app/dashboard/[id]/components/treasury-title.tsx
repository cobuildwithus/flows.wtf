import { Badge } from "@/components/ui/badge"
import { EthInUsd } from "@/components/global/eth-in-usd"
import { useRevnetBalance } from "@/lib/revnet/hooks/use-revnet-balance"
import { getRevnetUrl } from "@/lib/revnet/revnet-lib"
import { Startup } from "@/lib/onchain-startup/startup"
import Link from "next/link"

interface Props {
  startup: Startup
  chainId: number
}

export function TreasuryTitle({ startup, chainId }: Props) {
  const { data, isLoading, error } = useRevnetBalance(
    BigInt(startup.revnetProjectIds.base),
    chainId,
  )

  if (error) {
    console.error("Error loading treasury balance:", error)
  }

  const balance = data?.balance ? BigInt(data.balance) : BigInt(0)

  return (
    <div className="flex w-full items-center justify-between gap-1 text-base">
      <Link
        href={getRevnetUrl(chainId, Number(startup.revnetProjectIds.base))}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        Treasury
      </Link>
      <Badge className="text-sm" variant="secondary">
        {isLoading ? "..." : <EthInUsd amount={balance} />}
      </Badge>
    </div>
  )
}
