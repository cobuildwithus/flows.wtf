import "server-only"

import { getShortEthAddress } from "@/lib/utils"
import { Suspense, type JSX } from "react"
import { getUserProfile, type Profile } from "./get-user-profile"
import { UserProfilePopover } from "./user-popover"
import { ProfileLink } from "./profile-link"

type Props = {
  address: `0x${string}`
  children: (profile: Profile) => JSX.Element
  withPopover?: boolean
}

export const UserProfile = async (props: Props) => {
  const { address, children } = props

  return (
    <Suspense fallback={children({ address, display_name: getShortEthAddress(address) })}>
      <UserProfileInner {...props} />
    </Suspense>
  )
}

const UserProfileInner = async (props: Props) => {
  const { address, children, withPopover = true } = props

  const profile = await getUserProfile(address)

  if (withPopover) {
    return (
      <UserProfilePopover profile={profile}>
        <ProfileLink username={profile.username} address={profile.address}>
          {children(profile)}
        </ProfileLink>
      </UserProfilePopover>
    )
  }

  return children(profile)
}
