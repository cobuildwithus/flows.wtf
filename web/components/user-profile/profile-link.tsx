import { cn, explorerUrl } from "@/lib/utils"

interface ProfileLinkProps {
  username?: string
  address: `0x${string}`
  children: React.ReactNode
  className?: string
  chainId: number
}

export function ProfileLink({ username, address, children, className, chainId }: ProfileLinkProps) {
  return (
    <a
      href={
        username ? `https://farcaster.xyz/${username}` : explorerUrl(address, chainId, "address")
      }
      className={cn("text-muted-foreground transition-colors hover:text-foreground", className)}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  )
}
