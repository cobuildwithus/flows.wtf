import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  getTopContributorsForAllStartups,
  type TopContributor,
} from "@/lib/onchain-startup/top-holders"
import { UserProfile } from "@/components/user-profile/user-profile"
import { type Profile } from "@/components/user-profile/get-user-profile"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { EthInUsd } from "@/components/global/eth-in-usd"

export default async function TopHolders() {
  const contributorsData = await getTopContributorsForAllStartups()

  console.log(contributorsData)

  return (
    <div>
      <Tabs defaultValue="allTime" className="w-full">
        <TabsList className="mb-3 grid w-fit grid-cols-2 gap-2 bg-transparent p-0">
          <TabsTrigger
            value="allTime"
            className="min-w-20 rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            All Time
          </TabsTrigger>
          <TabsTrigger
            value="weekly"
            className="min-w-20 rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            This Week
          </TabsTrigger>
        </TabsList>

        <TabsContent value="allTime">
          <ContributorsList contributors={contributorsData.allTime} />
        </TabsContent>

        <TabsContent value="weekly">
          <ContributorsList contributors={contributorsData.weekly} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ContributorsListProps {
  contributors: TopContributor[]
}

function ContributorsList({ contributors }: ContributorsListProps) {
  return (
    <div className="space-y-6">
      <ScrollArea className="h-[650px] pr-4">
        <div className="space-y-4">
          {contributors.map((contributor, i) => (
            <TopContributorItem key={contributor.address} contributor={contributor} rank={i + 1} />
          ))}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  )
}

interface TopContributorItemProps {
  contributor: TopContributor
  rank: number
}

function TopContributorItem({ contributor, rank }: TopContributorItemProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border/20 bg-background/50 p-4 transition-colors hover:bg-background/80">
      {/* Rank */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
        {rank}
      </div>

      {/* Contributor Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="w-fit">
          <UserProfile address={contributor.address as `0x${string}`}>
            {(profile: Profile) => (
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 shrink-0">
                  {profile.pfp_url ? (
                    <img
                      src={profile.pfp_url}
                      alt={profile.display_name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                      {profile.display_name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="truncate font-medium hover:text-primary">
                  {profile.display_name}
                </span>
              </div>
            )}
          </UserProfile>
        </div>

        {/* Startup Badges */}
        <div className="flex flex-wrap gap-1">
          {contributor.startups.map((startup) => (
            <Link key={startup.id} href={`/startup/${startup.slug}`}>
              <Badge variant="secondary" className="text-xs hover:bg-secondary/80">
                {startup.name}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Payment Info */}
      <div className="flex shrink-0 flex-col items-end gap-1 text-right">
        <div className="text-sm font-semibold">
          <EthInUsd amount={BigInt(contributor.totalAmount)} /> contributed
        </div>
        <div className="text-xs text-muted-foreground">
          {contributor.paymentCount} payment{contributor.paymentCount !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  )
}
