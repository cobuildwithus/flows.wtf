import Image from "next/image"
import { TeamMember } from "@/lib/onchain-startup/team-members"
import { UserProfilePopover } from "@/components/user-profile/user-popover"

interface Props {
  members: Array<TeamMember>
}

export function ShortTeam(props: Props) {
  const { members } = props

  return (
    <div className="pointer-events-auto flex items-center gap-2.5">
      {members.map((member) => (
        <UserProfilePopover
          key={member.address}
          profile={{
            username: member.username,
            pfp_url: member.pfp_url,
            display_name: member.display_name,
            address: member.address,
            bio: member.bio,
          }}
        >
          <Image
            src={member.pfp_url || ""}
            alt={member.display_name}
            width={32}
            height={32}
            className="size-8 cursor-pointer rounded-full shadow transition-opacity hover:opacity-80"
          />
        </UserProfilePopover>
      ))}
    </div>
  )
}
