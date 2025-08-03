import { getIpfsUrl } from "@/lib/utils"
import { Startup } from "@/lib/onchain-startup/startup"
import { getRevnetHolders } from "@/lib/revnet/get-holders"
import { getTeamMemberCount } from "@/lib/onchain-startup/get-team-member-count"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface Props {
  startup: Startup
}

export async function Header({ startup }: Props) {
  const revnetProjectId = startup.jbxProjectId
  const chainId = startup.chainId

  const [holdersCount, teamMemberCount] = await Promise.all([
    revnetProjectId ? getRevnetHolders(revnetProjectId, chainId) : Promise.resolve(0),
    getTeamMemberCount(startup.id),
  ])

  return (
    <div className="flex items-center gap-6 pb-2 pt-6">
      <div className="flex flex-col items-center">
        <Image
          src={getIpfsUrl(startup.image, "pinata")}
          alt={startup.title}
          width={120}
          height={120}
          className="aspect-square rounded-lg object-cover"
          priority
        />
      </div>

      <div className="flex flex-col space-y-1.5 md:space-y-3.5">
        <h1 className="text-2xl font-bold tracking-tight md:text-4xl">{startup.title}</h1>
        <div className="space-y-2">
          <p className="text-muted-foreground md:text-xl">{startup.shortMission}</p>
          <div className="flex gap-2">
            <Badge variant="secondary" className="w-fit">
              {holdersCount} {holdersCount === 1 ? "holder" : "holders"}
            </Badge>
            <Badge variant="secondary" className="w-fit">
              {teamMemberCount} {teamMemberCount === 1 ? "team member" : "team members"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
