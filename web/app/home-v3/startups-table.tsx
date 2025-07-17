import Image from "next/image"
import Link from "next/link"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PercentChange } from "@/components/ui/percent-change"
import { getIpfsUrl } from "@/lib/utils"
import type { StartupWithRevenue } from "./types"
import { BuyRevnetDialog } from "./buy-revnet-dialog"
import { UserProfile } from "@/components/user-profile/user-profile"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Currency } from "@/components/ui/currency"
import { StartupStatsDialog } from "./startup-stats-dialog"

interface Props {
  startups: StartupWithRevenue[]
}

export function StartupsTable({ startups }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-lg font-semibold md:text-xl" />
          <TableHead className="hidden text-center text-lg font-semibold md:table-cell md:text-xl">
            Team
          </TableHead>
          <TableHead className="text-center text-lg font-semibold md:text-xl">Revenue</TableHead>
          <TableHead className="hidden text-center text-lg font-semibold md:table-cell md:text-xl">
            Backers
          </TableHead>
          <TableHead className="text-right"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {startups.map((startup) => (
          <TableRow key={startup.id}>
            <TableCell className="space-y-1">
              <div className="flex flex-row items-center space-x-2 md:space-x-5">
                <div className="size-12 flex-shrink-0 md:size-16 lg:size-20">
                  <Image
                    src={getIpfsUrl(startup.image)}
                    alt={startup.title}
                    width={80}
                    height={80}
                    className="size-full rounded-full object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col space-y-0 overflow-hidden text-ellipsis md:space-y-1.5">
                  <Link
                    href={`/startup/${startup.id}`}
                    className="text-base font-medium duration-100 ease-out hover:text-primary md:whitespace-normal md:text-xl"
                  >
                    {startup.title}
                  </Link>
                  <p className="line-clamp-2 text-xs text-muted-foreground md:text-base">
                    {startup.shortMission}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden text-center md:table-cell">
              <div className="flex justify-center -space-x-2">
                {startup.team.slice(0, 3).map((member) => (
                  <UserProfile key={member.recipient} address={member.recipient as `0x${string}`}>
                    {(profile) => (
                      <Avatar className="size-8 border-2 border-background md:size-10">
                        <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                        <AvatarFallback className="text-sm md:text-base">
                          {profile.display_name[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </UserProfile>
                ))}
                {startup.team.length > 3 && (
                  <span className="ml-2 text-sm font-medium text-muted-foreground md:text-base">
                    +{startup.team.length - 3}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <StartupStatsDialog startup={startup}>
                <div className="flex cursor-pointer flex-col items-center">
                  <Currency className="text-base font-medium decoration-muted-foreground/40 underline-offset-4 hover:decoration-muted-foreground md:text-lg">
                    {startup.revenue}
                  </Currency>
                  {startup.salesChange !== 0 && (
                    <PercentChange value={startup.salesChange} className="text-sm md:text-base" />
                  )}
                </div>
              </StartupStatsDialog>
            </TableCell>
            <TableCell className="hidden text-center text-base md:table-cell md:text-lg">
              {startup.backers}
            </TableCell>

            <TableCell className="text-right">
              <BuyRevnetDialog startup={startup} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
