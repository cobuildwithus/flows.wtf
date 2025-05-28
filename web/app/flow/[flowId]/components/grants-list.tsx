"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { Profile } from "@/components/user-profile/get-user-profile"
import { useAllocateFlow } from "@/lib/voting/allocation-context"
import type { DerivedData } from "@prisma/flows"
import { GrantCard } from "./grant-card"
import { GrantsTable } from "../../../../components/global/grants-table"
import { LimitedGrant } from "@/lib/database/types"

interface Props {
  flow: LimitedGrant
  grants: Array<
    LimitedGrant & {
      derivedData: Pick<
        DerivedData,
        "lastBuilderUpdate" | "overallGrade" | "title" | "coverImage"
      > | null
      profile: Profile
    }
  >
}

export default function GrantsList(props: Props) {
  const { flow, grants } = props
  const { isActive } = useAllocateFlow()

  if (isActive) {
    return (
      <Card>
        <CardContent>
          <GrantsTable flow={flow} grants={grants} />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 xl:grid-cols-5">
      {grants.map((grant) => (
        <GrantCard key={grant.id} grant={grant} />
      ))}
    </div>
  )
}
