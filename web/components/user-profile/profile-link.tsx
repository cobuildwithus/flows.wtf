import { cn, explorerUrl } from "@/lib/utils"
import { base } from "viem/chains"

interface ProfileLinkProps {
  username?: string
  address: `0x${string}`
  children: React.ReactNode
  className?: string
}

export function ProfileLink({ username, address, children, className }: ProfileLinkProps) {
  return (
    <a
      href={
        username ? `https://farcaster.xyz/${username}` : explorerUrl(address, base.id, "address")
      }
      className={cn("text-muted-foreground transition-colors hover:text-foreground", className)}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  )
}
