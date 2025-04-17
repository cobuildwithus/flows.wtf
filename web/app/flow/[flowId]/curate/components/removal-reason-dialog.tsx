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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface Props {
  grant: RemovedGrant
}

export default function RemovalReasonDialog(props: Props) {
  const { grant } = props

  const completionRate = grant.derivedData?.deliverablesCompletionRate?.completionRate || 0
  const didFullyRug = completionRate < 20
  const didLikelyRug = completionRate < 40 && !didFullyRug
  const didRug = (didFullyRug || didLikelyRug) && grant.isRemoved

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          {didRug ? (
            <Badge variant="warning" className="gap-1.5 rounded-full px-3 py-1.5 capitalize">
              {getRemovalTypeIcon(getRemovalType(grant.disputeReason, grant.cancelledByBuilder))}
              <span className="text-xs font-medium tracking-wide">
                {didLikelyRug ? "Low impact" : "Possible rug"}
              </span>
            </Badge>
          ) : (
            <Badge
              variant={(() => {
                switch (
                  getRemovalType(grant.disputeReason, grant.cancelledByBuilder).toLowerCase()
                ) {
                  case "inactive":
                  case "low quality":
                  case "other":
                    return "default"
                  case "cancelled":
                    return "secondary"
                  default:
                    return "secondary"
                }
              })()}
              className="gap-1.5 rounded-full px-3 py-1.5 capitalize"
            >
              {getRemovalTypeIcon(getRemovalType(grant.disputeReason, grant.cancelledByBuilder))}
              {getRemovalType(grant.disputeReason, grant.cancelledByBuilder)}
            </Badge>
          )}
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
        {grant.isRemoved && grant.derivedData?.deliverablesCompletionRate && (
          <Collapsible
            defaultOpen={false}
            className="mt-4 rounded-xl border border-secondary-foreground/10 bg-secondary/20 shadow-sm"
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-2.5 hover:opacity-80">
              <span className="text-sm font-medium tracking-wide">Impact success</span>
              <span className="text-lg font-semibold text-primary">
                {grant.derivedData.deliverablesCompletionRate.completionRate}%
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground/80">
              {grant.derivedData.deliverablesCompletionRate.reason}
            </CollapsibleContent>
          </Collapsible>
        )}
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
