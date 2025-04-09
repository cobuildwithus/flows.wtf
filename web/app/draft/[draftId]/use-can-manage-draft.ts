"use client"

import { isAdmin } from "@/lib/database/helpers"
import type { Draft } from "@prisma/flows"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"

export function useCanManageDraft(draft: Draft) {
  const { address } = useAccount()
  const [canManage, setCanManage] = useState(false)

  const admin = isAdmin(address)

  useEffect(() => {
    setCanManage(
      !!address &&
        (draft.users.some((user) => user.toLowerCase() === address.toLowerCase()) || admin),
    )
  }, [address, draft.users, admin])

  return canManage
}
