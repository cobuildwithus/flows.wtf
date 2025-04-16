import "server-only"

import { getEthAddress } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserProfile } from "@/components/user-profile/user-profile"
import { Button } from "@/components/ui/button"
import { getRemovalType, getRemovalTypeIcon, formatEvidence } from "./utils"
import { RemovedGrant } from "./get-removed-grants"

interface Props {
  grant: RemovedGrant
}

export default function RemovalReasonDialog(props: Props) {
  const { grant } = props

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          <Badge
            variant={(() => {
              switch (getRemovalType(grant.disputeReason, grant.cancelledByBuilder).toLowerCase()) {
                case "inactive":
                case "low quality":
                  return "warning"
                case "other":
                  return "secondary"
                case "cancelled":
                  return "default"
                default:
                  return "default"
              }
            })()}
            className="gap-1.5 rounded-full px-3 py-1.5 capitalize"
          >
            {getRemovalTypeIcon(getRemovalType(grant.disputeReason, grant.cancelledByBuilder))}
            {getRemovalType(grant.disputeReason, grant.cancelledByBuilder)}
          </Badge>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <span className="font-medium">Challenged by</span>{" "}
            <UserProfile address={getEthAddress(grant.challenger)}>
              {(profile) => (
                <div className="inline-flex flex-shrink-0 items-center space-x-2">
                  <Avatar className="size-6 bg-accent text-xs">
                    <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                    <AvatarFallback>{profile.display_name[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-primary">{profile.display_name}</span>
                </div>
              )}
            </UserProfile>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="space-y-2">
          {formatEvidence(grant.disputeReason)}
        </DialogDescription>
        <DialogFooter>
          <DialogClose>
            <Button variant="ghost" size="sm" className="mt-6" tabIndex={-1}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
