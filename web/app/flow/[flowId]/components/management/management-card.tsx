import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { explorerUrl } from "@/lib/utils"
import Link from "next/link"

import { base } from "viem/chains"

export const ManagementCard = ({
  title,
  address,
  children,
}: {
  title: string
  address: `0x${string}` | undefined
  children: React.ReactNode
}) => {
  return (
    <div className="w-full space-y-4 rounded-lg bg-card p-4 shadow">
      <Collapsible>
        <CollapsibleTrigger className="flex w-full items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4">
          <ViewOnExplorer address={address} />
          {children}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

const ViewOnExplorer = ({ address }: { address?: `0x${string}` }) => {
  if (!address) return null

  return (
    <Link
      className="text-xs text-primary underline"
      href={explorerUrl(address, base.id, "address")}
      target="_blank"
    >
      View on Explorer
    </Link>
  )
}
