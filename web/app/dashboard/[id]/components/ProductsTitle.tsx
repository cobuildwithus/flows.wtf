import { useRevnetTokenDetails } from "@/lib/revnet/hooks/use-revnet-token-details"
import { Startup } from "@/lib/onchain-startup/startup"

interface Props {
  startup: Startup
  chainId: number
}

export function ProductsTitle({ startup, chainId }: Props) {
  const { data: tokenDetails, isLoading } = useRevnetTokenDetails(
    BigInt(startup.revnetProjectId),
    chainId,
  )

  const tokenSymbol = tokenDetails?.symbol || "TOKEN"

  return (
    <div className="flex items-center gap-1">
      <span>{startup.diagram.action.name},</span>
      <span>earn {isLoading ? "..." : tokenSymbol}</span>
    </div>
  )
}
