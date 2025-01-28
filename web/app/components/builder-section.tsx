import "server-only"

import { cn } from "@/lib/utils"
import { Grant } from "@prisma/flows"
import { ActionCard } from "./action-card/action-card"
import { HomepageActivity } from "./homepage-activity"

export async function BuilderSection({ grants }: { grants: Pick<Grant, "id" | "recipient">[] }) {
  const hasGrant = grants.length > 0
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-2 rounded-2xl bg-gradient-to-b from-secondary to-secondary/80",
        hasGrant ? "md:col-span-3 md:grid-cols-3" : "md:col-span-1 md:grid-cols-1",
      )}
    >
      <div
        className={cn(
          "relative isolate overflow-hidden p-5 pb-6",
          !hasGrant && "md:mx-auto md:w-full md:max-w-lg",
        )}
      >
        <ActionCard />
      </div>
      {hasGrant && (
        <div className="md:col-span-2">
          <HomepageActivity grants={grants} />
        </div>
      )}
    </div>
  )
}
