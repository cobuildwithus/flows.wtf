"use client"

import useSWR from "swr"

export function useRunUserJobs() {
  const { data, ...rest } = useSWR(
    "/api/user",
    async () => {
      const response = await fetch("/api/user")
      if (!response.ok) {
        throw new Error("Failed to run user jobs")
      }
      return response.json()
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  return {
    didRunBuilderProfile: data?.didRunBuilderProfile || false,
    success: data?.success || false,
    ...rest,
  }
}
