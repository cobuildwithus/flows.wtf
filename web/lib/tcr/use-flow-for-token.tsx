"use client"

import { getEthAddress } from "@/lib/utils"
import useSWR from "swr"
import { getFlowForToken } from "./get-flow-for-token"

export function useFlowForToken(token: string | undefined) {
  const { data, ...rest } = useSWR(token ? `${token}_flow` : null, () =>
    getFlowForToken(getEthAddress(token!!)),
  )

  return {
    flow: data,
    ...rest,
  }
}
