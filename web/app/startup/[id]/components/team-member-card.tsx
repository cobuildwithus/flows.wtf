"use server"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Currency, CurrencyDisplay } from "@/components/ui/currency"
import { TeamMember } from "@/lib/onchain-startup/team-members"
import { cn } from "@/lib/utils"
import { TeamMemberLink } from "./team-member-link"

export async function TeamMemberCard(props: {
  member: TeamMember
  isAllocator: boolean
  currency: CurrencyDisplay
}) {
  const { member, isAllocator, currency } = props

  const { display_name, pfp_url, username, bio } = member

  return (
    <div
      className={cn(
        "flex min-h-32 min-w-64 shrink-0 items-center space-x-4 rounded-lg border bg-accent/50 p-4 dark:bg-muted/30",
        {
          "hover:border-dashed hover:border-primary": isAllocator,
        },
      )}
    >
      <Avatar className="z-20 size-16">
        <AvatarImage src={pfp_url || ""} alt={display_name} />
        <AvatarFallback>{display_name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <div>
          <Badge variant="secondary">
            <Currency display={currency}>{member.monthlyIncomingFlowRate.toString()}</Currency> /mo
          </Badge>
          <h3 className="mt-2.5 text-sm font-medium">
            <TeamMemberLink username={username || ""} displayName={display_name}>
              {display_name}
            </TeamMemberLink>
          </h3>
          <div className="mb-3 mt-1 max-w-40 truncate text-xs text-muted-foreground">
            {member.tagline || bio}
          </div>
        </div>
      </div>
    </div>
  )
}
