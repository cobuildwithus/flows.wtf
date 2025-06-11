"use client"

import { useUserAllocations } from "../user-allocations/use-user-allocations"
import { useEffect, useState, useRef } from "react"
import { UserAllocation } from "../vote-types"

export function useExistingAllocations(contract: `0x${string}`) {
  const [allocations, setAllocations] = useState<UserAllocation[]>()
  const prevContractRef = useRef<string | undefined>(undefined)

  const { allocations: userAllocations, mutate: mutateUserAllocations } =
    useUserAllocations(contract)

  useEffect(() => {
    // Update allocations when:
    // 1. Initial load (allocations is undefined)
    // 2. Contract changes (different flow selected)
    if (allocations === undefined || prevContractRef.current !== contract) {
      setAllocations(userAllocations)
      prevContractRef.current = contract
    }
  }, [contract, userAllocations, allocations])

  return {
    userAllocations,
    mutateUserAllocations,
    allocations,
    setAllocations,
  }
}
