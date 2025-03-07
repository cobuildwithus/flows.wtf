import { MonthlyBudget } from "@/app/components/monthly-budget"
import { CircularProgress } from "@/app/item/[grantId]/components/circular-progress"
import { NewProgress } from "@/app/item/[grantId]/components/new-progress"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Profile } from "@/components/user-profile/get-user-profile"
import { Status } from "@/lib/enums"
import { getIpfsUrl } from "@/lib/utils"
import type { DerivedData, Grant } from "@prisma/flows"
import Link from "next/dist/client/link"
import Image from "next/image"
import { isGrantNew } from "./is-new"
import type { LimitedGrant } from "./grants-list"

interface Props {
  grant: LimitedGrant & {
    profile: Profile
    derivedData: Pick<DerivedData, "overallGrade" | "title"> | null
  }
}

export function GrantCard({ grant }: Props) {
  const { status, isDisputed, derivedData } = grant
  const grade = derivedData?.overallGrade || null

  const isChallenged = status === Status.ClearingRequested
  const isActive = !isDisputed && !isChallenged
  const isNew = isGrantNew(grant)

  return (
    <article className="group relative isolate overflow-hidden rounded-2xl bg-primary shadow-sm md:min-h-72">
      <Image
        alt=""
        src={getIpfsUrl(grant.image)}
        className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-300 group-hover:scale-110"
        width={256}
        height={256}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-gray-900/70 from-25% via-transparent to-gray-900/80" />

      <Link
        href={`/item/${grant.id}`}
        className="flex h-full flex-col justify-between overflow-hidden p-2.5"
      >
        <div className="relative flex items-center justify-between text-sm">
          {isActive && <MonthlyBudget display={grant.monthlyIncomingFlowRate} flow={grant} />}
          {!isActive && <DisputedGrantTag />}

          {grade && !isNew && <CircularProgress value={grade} size={26} />}
          {isNew && <NewProgress size={26} />}
        </div>

        <div className="mt-32 flex translate-y-[26px] flex-col transition-transform duration-300 group-hover:translate-y-0">
          <h3 className="line-clamp-3 text-balance text-sm font-medium leading-5 text-white md:text-[15px]">
            {grant.derivedData?.title || grant.title}
          </h3>

          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-white/75">
            <Avatar className="z-20 size-4 border border-white/75 bg-primary text-xs">
              <AvatarImage src={grant.profile.pfp_url} alt={grant.profile.display_name} />
            </Avatar>
            <div>{grant.profile.display_name}</div>
          </div>
        </div>
      </Link>
    </article>
  )
}

function DisputedGrantTag() {
  return (
    <Tooltip>
      <TooltipTrigger tabIndex={-1}>
        <Badge variant="warning">Disputed</Badge>
      </TooltipTrigger>
      <TooltipContent>This grant has been disputed and is under review.</TooltipContent>
    </Tooltip>
  )
}
