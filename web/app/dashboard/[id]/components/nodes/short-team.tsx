import Image from "next/image"
import { TeamMember } from "@/lib/onchain-startup/team-members"

interface Props {
  members: Array<TeamMember>
}

export function ShortTeam(props: Props) {
  const { members } = props

  return (
    <div className="pointer-events-auto flex items-center gap-2.5">
      {members.map((member) => (
        <a
          key={member.address}
          href={`https://farcaster.xyz/${member.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-80"
        >
          <Image
            src={member.pfp_url || ""}
            alt={member.display_name}
            width={28}
            height={28}
            className="size-7 rounded-full shadow"
          />
        </a>
      ))}
    </div>
  )
}
