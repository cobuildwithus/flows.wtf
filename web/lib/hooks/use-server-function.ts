import useSWR, { SWRConfiguration, SWRResponse } from "swr"

type ServerFunction<T, P extends any[]> = (...args: P) => Promise<T>

export function useServerFunction<T, P extends any[]>(
  serverFunction: ServerFunction<T, P>,
  name: string, // used for swr caching/revalidation
  params: P,
  config?: SWRConfiguration,
): SWRResponse<T, any> {
  const key = params.every((param) => param !== undefined)
    ? `${name}:${JSON.stringify(params)}`
    : undefined

  const fetcher = async () => {
    return await serverFunction(...params)
  }

  return useSWR(key, fetcher, config)
}
