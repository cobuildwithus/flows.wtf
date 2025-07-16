"use client"

import { getShortEthAddress } from "@/lib/utils"
import { type JSX } from "react"
import { type Profile } from "./get-user-profile"
import { getUserProfile } from "./get-user-profile"
import { UserProfilePopover } from "./user-popover"
import { ProfileLink } from "./profile-link"
import { base } from "viem/chains"
import { useServerFunction } from "@/lib/hooks/use-server-function"

type Props = {
  address: `0x${string}`
  children: (profile: Profile) => JSX.Element
  withPopover?: boolean
  hideLink?: boolean
}

export const UserProfileClient = (props: Props) => {
  const { address, children, withPopover = true, hideLink = false } = props

  const { data: profile, isLoading } = useServerFunction(getUserProfile, "getUserProfile", [
    address,
  ])

  // Show loading state with short address
  if (isLoading || !profile) {
    return children({
      address,
      display_name: getShortEthAddress(address),
      username: undefined,
      pfp_url: undefined,
      bio: undefined,
      fid: undefined,
    })
  }

  const content = hideLink ? (
    children(profile)
  ) : (
    <ProfileLink username={profile.username} address={profile.address} chainId={base.id}>
      {children(profile)}
    </ProfileLink>
  )

  if (withPopover) {
    return (
      <UserProfilePopover profile={profile}>
        <div className="flex">{content}</div>
      </UserProfilePopover>
    )
  }

  return content
}
