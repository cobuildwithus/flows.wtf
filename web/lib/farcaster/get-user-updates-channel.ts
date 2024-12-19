"use server"

import { cache } from "react"
import { FLOWS_CHANNEL_ID, NOUNS_CHANNEL_ID } from "../config"
import { getFarcasterUserByEthAddress } from "./get-user"
import { getFarcasterUserChannels } from "./get-user-channels"

const emptyResponse = {
  hasFarcasterAccount: false,
  isNounsMember: false,
  isFlowsMember: false,
  updatesChannel: null,
}

export const getUserUpdatesChannel = cache(async (address: `0x${string}` | undefined) => {
  try {
    if (!address) return emptyResponse

    const user = await getFarcasterUserByEthAddress(address)
    if (!user) return emptyResponse

    const channelIds = (await getFarcasterUserChannels(Number(user.fid))).map(
      (channel) => channel.channelId,
    )
    const isNounsMember = channelIds.includes(NOUNS_CHANNEL_ID)
    const isFlowsMember = channelIds.includes(FLOWS_CHANNEL_ID)

    return {
      hasFarcasterAccount: true,
      isNounsMember,
      isFlowsMember,
      updatesChannel: isNounsMember ? NOUNS_CHANNEL_ID : isFlowsMember ? FLOWS_CHANNEL_ID : null,
    }
  } catch (e: any) {
    console.error(e?.message)
    return emptyResponse
  }
})
