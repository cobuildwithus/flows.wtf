"use server"

import { Badge } from "@/components/ui/badge"
import { Currency } from "@/components/ui/currency"
import { TeamMember } from "@/lib/onchain-startup/team-members"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { TeamMemberLink } from "./team-member-link"

export async function TeamMemberCard(props: { member: TeamMember; isAllocator: boolean }) {
  const { member, isAllocator } = props

  const { display_name, pfp_url, username } = member

  return (
    <div
      className={cn(
        "flex min-w-64 shrink-0 items-center space-x-4 rounded-lg border bg-accent/50 p-4 dark:bg-muted/30",
        {
          "hover:border-dashed hover:border-primary": isAllocator,
        },
      )}
    >
      <Image
        src={pfp_url || ""}
        alt={display_name}
        width={64}
        height={64}
        className="z-20 size-16 rounded-full"
      />
      <div className="flex flex-col">
        <div>
          <Badge variant="secondary">
            <Currency>{member.monthlyIncomingFlowRate.toString()}</Currency> /mo
          </Badge>
          <h3 className="mt-2.5 text-sm font-medium">
            <TeamMemberLink username={username || ""} displayName={display_name}>
              {display_name}
            </TeamMemberLink>
          </h3>

          <div className="mb-3 mt-1 text-xs text-muted-foreground">{member.tagline}</div>
        </div>
      </div>
    </div>
  )
}
