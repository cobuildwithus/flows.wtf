import "server-only"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { UserProfile } from "@/components/user-profile/user-profile"

interface Props {
  allocator: `0x${string}`
}

export const Allocator = async (props: Props) => {
  const { allocator } = props

  return (
    <>
      <UserProfile address={allocator} key={allocator}>
        {(profile) => (
          <div className="flex items-center">
            <Avatar className="mr-2.5 size-7 rounded-full bg-primary">
              <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
            </Avatar>

            <span className="truncate text-base font-medium text-black dark:text-white">
              {profile.display_name}
            </span>
          </div>
        )}
      </UserProfile>
    </>
  )
}
