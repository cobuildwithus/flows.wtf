import "server-only"

import { DraftPublishButton } from "@/app/draft/[draftId]/draft-publish-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DateTime } from "@/components/ui/date-time"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserProfile } from "@/components/user-profile/user-profile"
import database from "@/lib/database/edge"
import { FlowSubmenu } from "../components/flow-submenu"
import { GrantLogoCell } from "../components/grant-logo-cell"
import { GrantTitleCell } from "../components/grant-title-cell"
import { DRAFT_CUTOFF_DATE } from "@/lib/config"
import { getUser } from "@/lib/auth/user"

interface Props {
  params: Promise<{ flowId: string }>
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function FlowDraftsPage(props: Props) {
  const { flowId } = await props.params

  const [flow, drafts, existingGrants, user] = await Promise.all([
    database.grant.findFirstOrThrow({
      where: { id: flowId, isFlow: true },
      include: { derivedData: true },
    }),
    database.draft.findMany({
      where: { flowId, isPrivate: false, isOnchain: false, createdAt: { gt: DRAFT_CUTOFF_DATE } },
      orderBy: { createdAt: "desc" },
    }),
    getExistingGrantsCount(),
    getUser(),
  ])

  const { isTopLevel } = flow

  if (drafts.length === 0) {
    return (
      <>
        <FlowSubmenu flowId={flowId} segment="drafts" />
        <EmptyState title="No drafts found" description="Maybe go and create one?" />
      </>
    )
  }

  return (
    <>
      <FlowSubmenu flowId={flowId} segment="drafts" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={2}>Name</TableHead>
            <TableHead className="max-sm:hidden">{isTopLevel ? "Proposer" : "Builders"}</TableHead>
            <TableHead className="text-center">Created</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drafts.map((draft) => (
            <TableRow key={draft.id}>
              <GrantLogoCell image={draft.image} title={draft.title} />
              <GrantTitleCell title={draft.title} href={`/draft/${draft.id}`} />
              <TableCell className="max-sm:hidden">
                <div className="flex space-x-0.5">
                  {draft.users.map((user) => (
                    <UserProfile address={user as `0x${string}`} key={user}>
                      {(profile) => (
                        <div className="flex items-center space-x-1.5">
                          <Avatar className="size-7 bg-accent text-xs">
                            <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                            <AvatarFallback>{profile.display_name[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="tracking-tight max-sm:hidden">
                            {profile.display_name}
                          </span>
                        </div>
                      )}
                    </UserProfile>
                  ))}
                </div>
              </TableCell>

              <TableCell className="text-center max-sm:text-xs">
                <DateTime date={draft.createdAt} relative short />
              </TableCell>

              <TableCell className="w-[100px] max-w-[100px]">
                <div className="flex justify-end">
                  <DraftPublishButton
                    grantsCount={existingGrants[draft.users[0]] || 0}
                    draft={draft}
                    flow={flow}
                    user={user}
                    size="sm"
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

async function getExistingGrantsCount() {
  const counts = await database.grant.groupBy({
    by: ["recipient"],
    where: {
      isActive: true,
      monthlyIncomingBaselineFlowRate: { not: "0" },
    },
    _count: {
      recipient: true,
    },
  })

  return counts.reduce(
    (acc, curr) => ({
      ...acc,
      [curr.recipient]: curr._count.recipient,
    }),
    {} as Record<string, number>,
  )
}
