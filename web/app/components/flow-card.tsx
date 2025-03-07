import { GrantStatusCountBadges } from "@/components/ui/grant-status-count-badges"
import { getIpfsUrl } from "@/lib/utils"
import type { LimitedFlow } from "./flows-table"
import Image from "next/image"
import Link from "next/link"
import { MonthlyBudget } from "./monthly-budget"

interface Props {
  flow: LimitedFlow
}

export function FlowCard({ flow }: Props) {
  return (
    <article className="group relative isolate flex flex-col justify-between overflow-hidden rounded-2xl bg-primary p-5">
      <Image
        alt=""
        src={getIpfsUrl(flow.image)}
        className="pointer-events-none absolute inset-0 -z-10 size-full scale-100 object-cover transition-transform group-hover:scale-110"
        width={312}
        height={312}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
      <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-secondary" />

      <div className="flex justify-between">
        <div className="relative z-20">
          <GrantStatusCountBadges id={flow.id} flow={flow} />
        </div>
        <MonthlyBudget
          display={flow.isFlow ? flow.monthlyOutgoingFlowRate : flow.monthlyIncomingFlowRate}
          flow={flow}
          approvedGrants={flow.activeRecipientCount}
        />
      </div>

      <div>
        <h3 className="mt-28 text-xl font-semibold text-white">
          <Link href={`/flow/${flow.id}`}>
            <span className="absolute inset-0" />
            {flow.title}
          </Link>
        </h3>
        <div className="mt-1 line-clamp-1 text-xs text-gray-300">{flow.tagline}</div>
      </div>
    </article>
  )
}
