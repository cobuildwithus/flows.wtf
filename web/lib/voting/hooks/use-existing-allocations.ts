"use client"

import { useUserAllocations } from "../user-allocations/use-user-allocations"
import { useEffect, useState } from "react"
import { UserAllocation } from "../vote-types"

export function useExistingAllocations(contract: `0x${string}`) {
  const [allocations, setAllocations] = useState<UserAllocation[]>()

  const { allocations: userAllocations, mutate: mutateUserAllocations } =
    useUserAllocations(contract)

  useEffect(() => {
    if (typeof allocations !== "undefined") return
    if (!userAllocations.length) return
    setAllocations(userAllocations)
  }, [allocations, userAllocations])

  return {
    userAllocations,
    mutateUserAllocations,
    allocations,
    setAllocations,
  }
}
