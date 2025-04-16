import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserProfilePopover } from "@/components/user-profile/user-popover"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"
import { getIpfsUrl } from "@/lib/utils"
import { RemovedGrant } from "./get-removed-grants"

interface GrantCellProps {
  grant: RemovedGrant
}

export function GrantCell({ grant }: GrantCellProps) {
  return (
    <div className="flex items-center space-x-4 py-4">
      <div className="size-12 flex-shrink-0 md:size-20">
        <Image
          src={getIpfsUrl(grant.image)}
          alt={grant.title}
          width={80}
          height={80}
          className="size-full rounded-md object-cover"
        />
      </div>
      <div className="flex flex-col space-y-2">
        <div className="flex max-w-96 items-center space-x-3">
          <Link
            href={`/item/${grant.id}`}
            className="line-clamp-1 truncate text-lg font-medium duration-150 ease-in-out hover:text-primary md:whitespace-normal"
            tabIndex={-1}
          >
            {grant.title}
          </Link>
          {grant.reinstatedGrant && (
            <Link href={`/item/${grant.reinstatedGrant.id}`} target="_blank">
              <Badge variant="success" className="gap-1.5 rounded-full px-2.5 py-1 capitalize">
                <CheckCircle2 className="h-3 w-3" />
                Reinstated
              </Badge>
            </Link>
          )}
        </div>
        <div className="flex items-center space-x-1.5">
          <UserProfilePopover profile={grant.profile}>
            <div className="flex items-center space-x-1.5">
              <Avatar className="size-6 bg-accent text-xs">
                <AvatarImage src={grant.profile.pfp_url} alt={grant.profile.display_name} />
                <AvatarFallback>{grant.profile.display_name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm tracking-tight text-muted-foreground">
                {grant.profile.display_name}
              </span>
            </div>
          </UserProfilePopover>
        </div>
      </div>
    </div>
  )
}
