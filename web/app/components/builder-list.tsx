import { Prisma } from "@prisma/flows"
import Link from "next/link"
import { UserProfile } from "@/components/user-profile/user-profile"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Currency, type CurrencyDisplay } from "@/components/ui/currency"
import type { Profile } from "@/components/user-profile/get-user-profile"

interface Builder {
  id: number | string
  profile: Profile | null | undefined
  recipient: string
  monthlyIncomingFlowRate?: number | string | Prisma.Decimal | null
}

interface Props {
  builders: Builder[]
  currency: CurrencyDisplay
}

export default async function BuilderList({ builders, currency }: Props) {
  if (builders.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {builders.map((builder) => (
        <Link key={builder.id} href={`/item/${builder.id}`} className="block" prefetch={false}>
          <UserProfile address={builder.profile!.address} hideLink withPopover={false}>
            {(profile) => (
              <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <Avatar className="h-16 w-16 flex-shrink-0">
                  <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                  <AvatarFallback>
                    {profile.display_name?.charAt(0)?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate text-base font-medium">
                      {profile.display_name || "Anonymous"}
                    </h3>
                    <Badge variant="secondary">
                      <Currency display={currency}>
                        {builder.monthlyIncomingFlowRate?.toString() || "0"}
                      </Currency>
                      /mo
                    </Badge>
                  </div>
                  {profile.bio && (
                    <p className="mt-1 line-clamp-2 max-w-[200px] text-xs text-muted-foreground">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>
            )}
          </UserProfile>
        </Link>
      ))}
    </div>
  )
}
