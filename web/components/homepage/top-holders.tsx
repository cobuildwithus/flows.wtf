import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  getTopContributorsForAllStartups,
  type TopContributor,
} from "@/lib/onchain-startup/top-holders"
import { UserProfile } from "@/components/user-profile/user-profile"
import { type Profile } from "@/components/user-profile/get-user-profile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { EthInUsd } from "@/components/global/eth-in-usd"
import { getIpfsUrl } from "@/lib/utils"
import Image from "next/image"

export default async function TopHolders() {
  const contributorsData = await getTopContributorsForAllStartups()

  return (
    <div className="rounded-2xl border p-4 shadow-sm md:p-6 lg:col-span-3">
      <Tabs defaultValue="allTime" className="w-full">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Top backers</h3>
          <TabsList className="grid w-fit grid-cols-2 gap-2 bg-transparent p-0">
            <TabsTrigger
              value="allTime"
              className="min-w-20 rounded-full border border-border/20 bg-muted/30 text-xs text-muted-foreground data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:bg-muted/50"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="weekly"
              className="min-w-20 rounded-full border border-border/20 bg-muted/30 text-xs text-muted-foreground data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:bg-muted/50"
            >
              Week
            </TabsTrigger>
          </TabsList>
        </div>

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
    <ScrollArea className="md:h-[650px]">
      <div className="space-y-3 pr-2 md:space-y-4 md:pr-4">
        {contributors.map((contributor, i) => (
          <TopContributorItem key={contributor.address} contributor={contributor} rank={i + 1} />
        ))}
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  )
}

interface TopContributorItemProps {
  contributor: TopContributor
  rank: number
}

function TopContributorItem({ contributor, rank }: TopContributorItemProps) {
  return (
    <UserProfile address={contributor.address as `0x${string}`}>
      {(profile: Profile) => (
        <div className="flex items-center gap-3 rounded-xl border border-border/60 p-2 px-3 shadow-sm transition-colors hover:bg-muted/40 md:p-3">
          {/* Rank */}
          <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground md:flex md:text-sm">
            {rank}
          </div>

          {/* User Avatar */}
          <div className="relative h-8 w-8 shrink-0">
            {profile.pfp_url ? (
              <img
                src={profile.pfp_url}
                alt={profile.display_name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold md:text-sm">
                {profile.display_name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* User Info and Stats */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:gap-2">
              <span
                className="truncate text-sm font-medium md:text-base"
                title={profile.display_name}
              >
                {profile.display_name}
              </span>
              <span className="text-xs text-muted-foreground md:text-sm">
                backed {contributor.startups.length}{" "}
                {contributor.startups.length === 1 ? "project" : "projects"}
              </span>
            </div>
          </div>

          {/* Amount */}
          <div className="shrink-0 text-sm font-medium md:text-base">
            <EthInUsd amount={BigInt(contributor.totalAmount)} />
          </div>

          {/* Startup Avatars */}
          <div className="hidden shrink-0 -space-x-2 md:flex">
            {contributor.startups.slice(0, 3).map((startup) => (
              <Link key={startup.id} href={`/${startup.slug}`}>
                <div className="relative size-6 overflow-hidden rounded-full border-2 border-background hover:z-10">
                  {startup.image && (
                    <Image
                      src={getIpfsUrl(startup.image)}
                      alt={startup.name}
                      width={24}
                      height={24}
                      className="size-full object-cover"
                    />
                  )}
                </div>
              </Link>
            ))}
            {contributor.startups.length > 3 && (
              <div className="flex size-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground">
                +{contributor.startups.length - 3}
              </div>
            )}
          </div>
        </div>
      )}
    </UserProfile>
  )
}
