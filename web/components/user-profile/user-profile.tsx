import "server-only"

import { getShortEthAddress } from "@/lib/utils"
import { Suspense, type JSX } from "react";
import { getUserProfile, Profile } from "./get-user-profile"
import { UserProfilePopover } from "./user-popover"

type Props = {
  address: `0x${string}`
  children: (profile: Profile) => JSX.Element
  withPopover?: boolean
}

export const UserProfile = async (props: Props) => {
  const { address, children } = props

  return (
    <Suspense
      fallback={children({
        address,
        display_name: getShortEthAddress(address),
      })}
    >
      <UserProfileInner {...props} />
    </Suspense>
  )
}

const UserProfileInner = async (props: Props) => {
  const { address, children, withPopover = true } = props

  const profile = await getUserProfile(address)

  if (withPopover) {
    return <UserProfilePopover profile={profile}>{children(profile)}</UserProfilePopover>
  }

  return children(profile)
}
