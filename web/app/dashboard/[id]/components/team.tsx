import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Currency } from "@/components/ui/currency"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { getUserProfile } from "@/components/user-profile/get-user-profile"
import { TeamMember } from "@/lib/onchain-startup/team-members"
import Image from "next/image"
import Link from "next/link"

interface Props {
  members: TeamMember[]
}

export async function Team(props: Props) {
  const { members } = props

  return (
    <ScrollArea className="pointer-events-auto mt-2 w-full whitespace-nowrap">
      <div className="flex space-x-4">
        {members.map((m) => (
          <TeamMemberCard key={m.recipient} member={m} />
        ))}
        <OpportunityCard title="Artist" description="Making logo bigger" />
        <OpportunityCard title="Barista" description="Remember guests names" />
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

async function TeamMemberCard(props: { member: TeamMember }) {
  const { member } = props

  const profile = await getUserProfile(member.recipient as `0x${string}`)
  const { display_name, pfp_url, username } = profile

  return (
    <div className="flex shrink-0 flex-col items-center">
      <Image
        src={pfp_url!}
        alt={display_name}
        width={64}
        height={64}
        className="z-20 size-14 rounded-full shadow"
      />
      <div className="-mt-7 flex w-64 grow flex-col items-center justify-between rounded-lg bg-accent/50 p-4 pt-12 dark:bg-muted/30">
        <div className="text-center">
          <h3 className="text-sm font-medium">
            <Link href={`https://warpcast.com/${username}`} className="hover:underline">
              {display_name}
            </Link>
          </h3>
          <div className="mb-3 mt-1 text-xs text-muted-foreground">{member.description}</div>
        </div>
        <Badge>
          <Currency>{member.monthlyIncomingFlowRate.toString()}</Currency> /mo
        </Badge>
      </div>
    </div>
  )
}

async function OpportunityCard(props: { title: string; description: string }) {
  const { title, description } = props

  return (
    <div className="flex shrink-0 flex-col items-center pt-7">
      <div className="flex w-56 grow flex-col justify-between rounded-lg border border-dashed border-primary p-4 dark:border-muted/50">
        <div>
          <Badge variant="warning" className="mb-2.5 py-0 text-[11px]">
            Vacancy
          </Badge>
          <h3 className="text-sm font-medium">{title}</h3>
          <div className="mt-1 text-xs text-muted-foreground">{description}</div>
        </div>
        <Button size="sm" className="mt-4 py-0.5">
          Apply
        </Button>
      </div>
    </div>
  )
}
