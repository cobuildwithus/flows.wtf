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

interface Props {
  startups: StartupWithRevenue[]
}

export function StartupsTable({ startups }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead colSpan={2}>Project</TableHead>
          <TableHead className="text-center">Team</TableHead>
          <TableHead className="text-center">Revenue</TableHead>
          <TableHead className="text-center">Holders</TableHead>
          <TableHead className="text-right"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {startups.map((startup) => (
          <TableRow key={startup.id}>
            <TableCell className="w-8 pr-0 md:w-12 md:pr-0">
              <div className="size-8 md:size-12">
                <Image
                  src={getIpfsUrl(startup.image)}
                  alt={startup.title}
                  width={48}
                  height={48}
                  className="size-full rounded-full object-cover"
                />
              </div>
            </TableCell>

            <TableCell className="space-y-1">
              <div className="overflow-hidden text-ellipsis">
                <Link
                  href={`/startup/${startup.id}`}
                  className="text-sm font-medium duration-100 ease-out hover:text-primary md:whitespace-normal"
                >
                  {startup.title}
                </Link>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {startup.shortMission}
                </p>
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className="flex justify-center -space-x-2">
                {startup.team.slice(0, 3).map((member) => (
                  <UserProfile key={member.recipient} address={member.recipient as `0x${string}`}>
                    {(profile) => (
                      <Avatar className="size-7 border-2 border-background">
                        <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                        <AvatarFallback>{profile.display_name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                  </UserProfile>
                ))}
                {startup.team.length > 3 && (
                  <span className="ml-1 text-xs font-medium text-muted-foreground">
                    +{startup.team.length - 3}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className="flex flex-col items-center">
                <Currency className="text-sm font-medium">{startup.revenue}</Currency>
                {startup.salesChange !== 0 && (
                  <PercentChange value={startup.salesChange} className="text-xs" />
                )}
              </div>
            </TableCell>
            <TableCell className="text-center">{startup.backers}</TableCell>

            <TableCell className="text-right">
              <BuyRevnetDialog startup={startup} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
