import { explorerUrl } from "@/lib/utils"
import { base } from "viem/chains"

interface ProfileLinkProps {
  username?: string
  address: `0x${string}`
  children: React.ReactNode
}

export function ProfileLink({ username, address, children }: ProfileLinkProps) {
  return (
    <a
      href={
        username ? `https://warpcast.com/${username}` : explorerUrl(address, base.id, "address")
      }
      className="text-muted-foreground transition-colors hover:text-foreground"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  )
}
