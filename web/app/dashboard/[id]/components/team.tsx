import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Currency } from "@/components/ui/currency"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { getUserProfile } from "@/components/user-profile/get-user-profile"
import { TeamMember } from "@/lib/onchain-startup/team-members"
import Image from "next/image"

interface Props {
  members: TeamMember[]
}

export async function Team(props: Props) {
  const { members } = props

  return (
    <>
      <div className="relative h-full w-9 shrink-0">
        <div className="absolute left-4 top-5 z-10 origin-right -translate-x-full -rotate-90 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground">
          Meet the team
        </div>
      </div>
      <ScrollArea className="pointer-events-auto mt-2 grow whitespace-nowrap">
        <div className="flex space-x-4">
          {members.map((m) => (
            <TeamMemberCard key={m.recipient} member={m} />
          ))}
          <OpportunityCard title="Artist" description="Making logo bigger" />
          <OpportunityCard title="Barista" description="Remember guests names" />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </>
  )
}

async function TeamMemberCard(props: { member: TeamMember }) {
  const { member } = props

  const profile = await getUserProfile(member.recipient as `0x${string}`)
  const { display_name, pfp_url, username } = profile

  return (
    <div className="flex min-w-64 shrink-0 items-center space-x-4 rounded-lg border bg-accent/50 p-4 dark:bg-muted/30">
      <Image
        src={pfp_url!}
        alt={display_name}
        width={64}
        height={64}
        className="z-20 size-16 rounded-full"
      />
      <div className="flex flex-col">
        <div>
          <Badge>
            <Currency>{member.monthlyIncomingFlowRate.toString()}</Currency> /mo
          </Badge>
          <h3 className="mt-2.5 text-sm font-medium">
            <a
              href={`https://farcaster.xyz/${username}`}
              className="hover:underline"
              target="_blank"
            >
              {display_name}
            </a>
          </h3>

          <div className="mb-3 mt-1 text-xs text-muted-foreground">{member.description}</div>
        </div>
      </div>
    </div>
  )
}

async function OpportunityCard(props: { title: string; description: string }) {
  const { title, description } = props

  return (
    <div className="flex shrink-0 flex-col items-center">
      <div className="flex w-56 grow flex-col justify-between rounded-lg border border-dashed border-primary p-4 dark:border-muted/50">
        <div>
          <Badge variant="warning" className="py-0 text-[11px]">
            Vacancy
          </Badge>
          <h3 className="mt-2.5 text-sm font-medium">{title}</h3>
          <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>
        </div>
        <Button size="sm" className="mt-3 py-0.5">
          Apply
        </Button>
      </div>
    </div>
  )
}
