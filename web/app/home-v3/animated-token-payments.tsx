"use client"

import { useEffect, useState } from "react"
import { DateTime } from "@/components/ui/date-time"
import { ProfileLink } from "@/components/user-profile/profile-link"
import { cn } from "@/lib/utils"
import { Profile } from "@/components/user-profile/get-user-profile"
import { TokenPayment } from "@/lib/onchain-startup/token-payments"
import { EthInUsd } from "@/components/global/eth-in-usd"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"

interface ExtendedTokenPayment extends TokenPayment {
  startup: {
    name: string
    slug: string
  }
}

interface Props {
  payments: ExtendedTokenPayment[]
  profiles: Record<string, Profile>
  className?: string
}

export function AnimatedTokenPayments({ payments, profiles, className }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Cycle through payments
  useEffect(() => {
    if (payments.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % payments.length)
    }, 4000) // Change every 4 seconds

    return () => clearInterval(interval)
  }, [payments.length])

  if (payments.length === 0) return null

  const currentPayment = payments[currentIndex]
  const profile = profiles[currentPayment.beneficiary]

  // Use ethAmount if available, otherwise fallback to amount
  const ethAmount = currentPayment.ethAmount || currentPayment.amount
  const ethAmountBigInt = BigInt(ethAmount)

  return (
    <div
      className={cn(
        "absolute bottom-8 left-1/2 z-30 -translate-x-1/2",
        "rounded-full bg-background/90 backdrop-blur-md",
        "border border-border/50 shadow-lg",
        "min-w-[280px] max-w-[360px] px-4 py-2.5",
        "transition-all duration-500",
        className,
      )}
    >
      <div
        key={currentIndex}
        className="flex items-center gap-3 duration-500 animate-in fade-in slide-in-from-bottom-2"
      >
        {/* Profile Picture */}
        <div className="relative flex-shrink-0">
          <Avatar className="size-8 ring-2 ring-background">
            <AvatarImage src={profile?.pfp_url} alt={profile?.display_name || ""} />
            <AvatarFallback className="text-xs text-muted-foreground">
              {profile?.display_name?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5 text-sm">
            <ProfileLink
              address={currentPayment.beneficiary as `0x${string}`}
              username={profile?.username}
              className="max-w-[120px] truncate font-medium text-foreground hover:text-primary"
              chainId={currentPayment.chainId}
            >
              {profile?.display_name || "Anonymous"}
            </ProfileLink>
            <span className="text-muted-foreground">backed</span>
            <Link
              href={`/startup/${currentPayment.startup.slug}`}
              className="max-w-[130px] truncate font-medium text-foreground hover:text-primary"
            >
              {currentPayment.startup.name}
            </Link>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className="font-semibold text-emerald-600">
              <EthInUsd amount={ethAmountBigInt} />
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              <DateTime date={new Date(currentPayment.timestamp * 1000)} relative short />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
