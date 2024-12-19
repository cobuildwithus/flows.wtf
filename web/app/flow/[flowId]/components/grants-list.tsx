"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Profile } from "@/components/user-profile/get-user-profile"
import { useVoting } from "@/lib/voting/voting-context"
import { DerivedData, Grant } from "@prisma/flows"
import { GrantCard } from "./grant-card"
import { GrantsTable } from "./grants-table"

interface Props {
  flow: Grant
  grants: Array<Grant & { derivedData: DerivedData | null; profile: Profile }>
}

export default function GrantsList(props: Props) {
  const { flow, grants } = props
  const { isActive } = useVoting()

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
