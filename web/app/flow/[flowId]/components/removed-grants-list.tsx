import "server-only"

import { EmptyState } from "@/components/ui/empty-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getEthAddress, getIpfsUrl } from "@/lib/utils"
import { getUserProfile } from "@/components/user-profile/get-user-profile"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import database, { getCacheStrategy } from "@/lib/database/edge"
import { UserProfilePopover } from "@/components/user-profile/user-popover"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Currency } from "@/components/ui/currency"
import { InfoIcon, AlertTriangle, Clock, XCircle, CheckCircle2, ChevronDown } from "lucide-react"
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface Props {
  flowId: string
  defaultOpen?: boolean
}

export default async function RemovedGrantsList(props: Props) {
  const { flowId, defaultOpen = false } = props

  const removedGrants = await database.grant.findMany({
    where: { flowId, isRemoved: true },
    omit: { description: true },
    include: {
      evidences: true,
      disputes: { include: { evidences: true } },
      derivedData: true,
    },
    ...getCacheStrategy(120),
  })

  const grants = await Promise.all(
    removedGrants.map(async (g) => {
      const [profile, reinstatedGrant] = await Promise.all([
        getUserProfile(getEthAddress(g.recipient)),
        database.grant.findFirst({
          where: {
            flowId,
            recipient: g.recipient,
            isActive: true,
            monthlyIncomingBaselineFlowRate: { not: "0" },
          },
          omit: { description: true },
        }),
      ])
      const numEvidences = g.evidences.length
      const latestDispute = g.disputes[g.disputes.length - 1]

      const relevantEvidence = latestDispute?.evidences[0] || g.evidences[numEvidences - 1]

      const disputeReason = relevantEvidence?.evidence || "No reason provided"
      const challenger = relevantEvidence?.party
      return {
        ...g,
        profile,
        disputeReason,
        reinstatedGrant,
        challenger,
      }
    }),
  )

  if (removedGrants.length === 0) {
    return (
      <>
        <EmptyState
          title="No removed grants found"
          description="No grants have been removed yet."
        />
      </>
    )
  }

  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger className="mb-4 flex w-full items-center justify-between hover:opacity-70">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2 font-semibold md:text-xl">
            <span className="text-muted-foreground">Removed</span>
            {removedGrants.length > 0 && (
              <span className="ml-1 inline-flex size-[18px] items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                {removedGrants.length}
              </span>
            )}
          </div>
          <span className="text-sm text-muted-foreground">Projects removed from the flow</span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={4}>Project</TableHead>
              <TableHead className="text-right">Total Earned</TableHead>
              <TableHead className="text-right">Removal reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grants.map((grant) => (
              <TableRow key={grant.id}>
                <TableCell colSpan={4}>
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
                            <Badge
                              variant="success"
                              className="gap-1.5 rounded-full px-2.5 py-1 capitalize"
                            >
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
                              <AvatarImage
                                src={grant.profile.pfp_url}
                                alt={grant.profile.display_name}
                              />
                              <AvatarFallback>
                                {grant.profile.display_name[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm tracking-tight text-muted-foreground">
                              {grant.profile.display_name}
                            </span>
                          </div>
                        </UserProfilePopover>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col justify-end space-y-1">
                    <Currency className="text-right text-xl font-medium">
                      {grant.totalEarned}
                    </Currency>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="cursor-pointer">
                        <Badge
                          variant={(() => {
                            switch (getRemovalType(grant.disputeReason).toLowerCase()) {
                              case "inactive":
                              case "low quality":
                                return "warning"
                              case "other":
                                return "secondary"
                              default:
                                return "default"
                            }
                          })()}
                          className="gap-1.5 rounded-full px-3 py-1.5 capitalize"
                        >
                          {getRemovalTypeIcon(getRemovalType(grant.disputeReason))}
                          {getRemovalType(grant.disputeReason)}
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
                                  <AvatarFallback>
                                    {profile.display_name[0].toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-primary">
                                  {profile.display_name}
                                </span>
                              </div>
                            )}
                          </UserProfile>
                        </DialogTitle>
                      </DialogHeader>
                      <DialogDescription className="space-y-2">
                        {formatEvidence(grant.disputeReason)}
                      </DialogDescription>
                      <DialogFooter>
                        <DialogClose>Close</DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function formatEvidence(evidence: string) {
  if (!evidence.includes(" || ")) {
    return <span className="text-muted-foreground">{evidence}</span>
  }

  const groups = evidence.split(" || ")
  const [type, ...comments] = groups
  return (
    <>
      {comments.length > 0 && (
        <span className="text-base text-muted-foreground">{comments.join(" ")}</span>
      )}
    </>
  )
}

function getRemovalType(evidence: string): string {
  if (!evidence.includes(" || ")) {
    return "Other"
  }

  const type = evidence.split(" || ")[0]

  if (type === "values-misalignment") {
    return "Values"
  }
  return type.replaceAll("-", " ")
}

function getRemovalTypeIcon(type: string) {
  switch (type.toLowerCase()) {
    case "inactive":
      return <Clock className="h-3 w-3" />
    case "low quality":
      return <AlertTriangle className="h-3 w-3" />
    case "other":
      return <InfoIcon className="h-3 w-3" />
    default:
      return <XCircle className="h-3 w-3" />
  }
}
