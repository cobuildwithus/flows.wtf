import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { HoverCardPortal } from "@radix-ui/react-hover-card"
import { ExternalLinkIcon } from "@radix-ui/react-icons"
import type { PropsWithChildren } from "react"
import type { Profile } from "./get-user-profile"
import { ProfileLink } from "./profile-link"
import { base } from "viem/chains"

interface Props {
  profile: Profile
}

export const UserProfilePopover = (props: PropsWithChildren<Props>) => {
  const { profile, children } = props
  const { username, pfp_url, display_name, address, bio } = profile

  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardPortal>
        <HoverCardContent className="w-96">
          <div className="flex items-center space-x-2.5 whitespace-normal">
            <Avatar className="size-10 bg-primary">
              <AvatarImage src={pfp_url} alt={display_name} />
              <AvatarFallback>{display_name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="flex flex-row items-center space-x-1.5 text-sm font-semibold">
                <span>{display_name}</span>
                <ProfileLink username={username} address={address} chainId={base.id}>
                  <ExternalLinkIcon className="size-3.5" />
                </ProfileLink>
              </h4>
              {bio && <p className="mt-0.5 text-xs text-muted-foreground">{bio}</p>}
            </div>
          </div>
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCard>
  )
}
