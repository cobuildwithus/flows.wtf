import { MonthlyBudget } from "@/app/components/monthly-budget"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Profile } from "@/components/user-profile/get-user-profile"
import { UserProfilePopover } from "@/components/user-profile/user-popover"
import { getIpfsUrl } from "@/lib/utils"
import { Grant } from "@prisma/flows"
import Link from "next/dist/client/link"
import Image from "next/image"

interface Props {
  grant: Grant & { profile: Profile }
}

export function GrantCard({ grant }: Props) {
  return (
    <article className="group relative isolate flex flex-col justify-between overflow-hidden rounded-2xl bg-primary px-2.5 py-4 md:min-h-72 md:p-4">
      <Image
        alt=""
        src={getIpfsUrl(grant.image)}
        className="absolute inset-0 -z-10 size-full object-cover transition-transform group-hover:scale-110"
        width={256}
        height={256}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-secondary" />

      <div className="flex items-center justify-between text-sm">
        <UserProfilePopover profile={grant.profile}>
          <Avatar className="z-20 size-6 border border-white/75 bg-primary text-xs">
            <AvatarImage src={grant.profile.pfp_url} alt={grant.profile.display_name} />
          </Avatar>
        </UserProfilePopover>
        <MonthlyBudget display={grant.monthlyIncomingFlowRate} flow={grant} />
      </div>

      <div>
        <h3 className="mt-32 text-balance text-sm font-medium text-white md:text-base">
          <Link href={`/item/${grant.id}`}>
            <span className="absolute inset-0" />
            {grant.title}
          </Link>
        </h3>
      </div>
    </article>
  )
}
