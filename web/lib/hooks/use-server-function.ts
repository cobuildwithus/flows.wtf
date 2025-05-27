"use client"

import useSWR, { type SWRConfiguration, type SWRResponse } from "swr"
import { serialize } from "@/lib/serialize"

type ServerFunction<T, P extends any[]> = (...args: P) => Promise<T>

export function useServerFunction<T, P extends any[]>(
  serverFunction: ServerFunction<T, P>,
  name: string | undefined, // used for swr caching/revalidation
  params: P,
  config?: SWRConfiguration,
): SWRResponse<T, any> {
  const key =
    name && params.every((param) => param !== undefined)
      ? `${name}:${JSON.stringify(serialize(params))}`
      : undefined

  const fetcher = async () => {
    return await serverFunction(...params)
  }

  return useSWR(key, fetcher, config)
}
