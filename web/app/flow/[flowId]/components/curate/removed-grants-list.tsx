import "server-only"

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
import { Button } from "@/components/ui/button"
import { Status } from "@/lib/enums"

interface Props {
  flowId: string
  defaultOpen?: boolean
  className?: string
  type: "removed" | "rejected"
}

export default async function RemovedGrantsList(props: Props) {
  const { flowId, defaultOpen = false, className, type } = props

  const isRejected = type === "rejected"

  const removedGrants = await getRemovedGrants(flowId, type)

  const grants = await Promise.all(removedGrants.map((g) => getGrantDetails(g, flowId)))

  if (removedGrants.length === 0) {
    return null
  }

  return (
    <Collapsible defaultOpen={defaultOpen} className={className}>
      <CollapsibleTrigger className="mb-4 flex w-full items-center justify-between hover:opacity-70">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2 font-semibold md:text-xl">
            <span className="text-muted-foreground">
              {type === "removed" ? "Removed" : "Rejected"}
            </span>
            {removedGrants.length > 0 && (
              <span className="ml-1 inline-flex size-[18px] items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                {removedGrants.length}
              </span>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {type === "removed"
              ? "Projects removed by curators"
              : "Applications rejected by curators"}
          </span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={4}>Project</TableHead>
              {!isRejected && <TableHead className="text-right">Total Earned</TableHead>}
              <TableHead className="text-right">Reason</TableHead>
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
                {!isRejected && (
                  <TableCell>
                    <div className="flex flex-col justify-end space-y-1">
                      <Currency className="text-right text-xl font-medium">
                        {grant.totalEarned}
                      </Currency>
                    </div>
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="cursor-pointer">
                        <Badge
                          variant={(() => {
                            switch (
                              getRemovalType(
                                grant.disputeReason,
                                grant.cancelledByBuilder,
                              ).toLowerCase()
                            ) {
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
                          {getRemovalTypeIcon(
                            getRemovalType(grant.disputeReason, grant.cancelledByBuilder),
                          )}
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
                        <DialogClose>
                          <Button variant="ghost" size="sm" className="mt-6" tabIndex={-1}>
                            Close
                          </Button>
                        </DialogClose>
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

function getRemovalType(evidence: string, cancelledByBuilder: boolean): string {
  if (cancelledByBuilder) {
    return "Cancelled"
  }

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
    case "cancelled":
      return <InfoIcon className="h-3 w-3" />
    default:
      return <XCircle className="h-3 w-3" />
  }
}

async function getRemovedGrants(flowId: string, type: "removed" | "rejected") {
  return await database.grant.findMany({
    where:
      type === "removed"
        ? { flowId, isRemoved: true }
        : { flowId, status: Status.Absent, isRemoved: false },
    omit: { description: true },
    include: {
      evidences: true,
      disputes: { include: { evidences: true } },
    },
    ...getCacheStrategy(120),
  })
}

type Grant = Awaited<ReturnType<typeof getRemovedGrants>>[number]

async function getGrantDetails(grant: Grant, flowId: string) {
  const [profile, reinstatedGrant] = await Promise.all([
    getUserProfile(getEthAddress(grant.recipient)),
    database.grant.findFirst({
      where: {
        flowId,
        recipient: grant.recipient,
        isActive: true,
        monthlyIncomingBaselineFlowRate: { not: "0" },
      },
      omit: { description: true },
    }),
  ])

  const numEvidences = grant.evidences.length
  const latestDispute = grant.disputes[grant.disputes.length - 1]

  const relevantEvidence = latestDispute?.evidences[0] || grant.evidences[numEvidences - 1]

  const disputeReason = relevantEvidence?.evidence || "No reason provided"
  const challenger = relevantEvidence?.party

  const cancelledByBuilder = grant.recipient === challenger

  return {
    profile,
    disputeReason,
    reinstatedGrant,
    challenger,
    cancelledByBuilder,
    ...grant,
  }
}
