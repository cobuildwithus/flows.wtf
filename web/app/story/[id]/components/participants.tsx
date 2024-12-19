import "server-only"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { UserProfile } from "@/components/user-profile/user-profile"
import Link from "next/link"

interface Props {
  addresses: string[]
}

export function Participants(props: Props) {
  const { addresses } = props

  if (addresses.length === 0) return null

  return (
    <div>
      <h2 className="text-sm font-medium text-muted-foreground">Builders</h2>
      <div className="mt-4 space-y-4">
        {addresses.map((address) => (
          <UserProfile address={address as `0x${string}`} key={address}>
            {(profile) => (
              <div className="flex items-center space-x-3">
                <Avatar className="size-7 bg-primary">
                  <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                </Avatar>
                <div className="flex flex-col items-start justify-center">
                  <Link
                    target="_blank"
                    href={`https://warpcast.com/${profile.username}`}
                    className="text-sm"
                  >
                    {profile.display_name}
                  </Link>
                </div>
              </div>
            )}
          </UserProfile>
        ))}
      </div>
    </div>
  )
}
