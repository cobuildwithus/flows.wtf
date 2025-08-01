"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DateTime } from "@/components/ui/date-time"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Profile } from "@/components/user-profile/get-user-profile"
import { Draft } from "@prisma/flows"
import { AddRecipientToFlowButton } from "@/components/global/add-recipient-to-flow-button"
import { publishDraft } from "@/app/draft/[draftId]/publish-draft"

export interface ApplicationWithProfile extends Draft {
  profile: Profile
}

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  opportunityTitle: string
  applications: ApplicationWithProfile[]
  flowContract: `0x${string}`
  chainId: number
}

function getStatusBadge(status: number) {
  switch (status) {
    case 0:
      return <Badge variant="outline">Awaiting</Badge>
    case 1:
      return <Badge variant="success">Accepted</Badge>
    case 2:
      return <Badge variant="destructive">Rejected</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export function ViewApplications(props: Props) {
  const { isOpen, onOpenChange, opportunityTitle, applications, flowContract, chainId } = props

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Applications for {opportunityTitle}</DialogTitle>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Builder</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="text-sm">
                      <DateTime
                        date={application.createdAt}
                        options={{
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="size-8">
                          <AvatarImage
                            src={application.profile.pfp_url}
                            alt={application.profile.display_name}
                          />
                          <AvatarFallback>
                            {application.profile.display_name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">
                            {application.profile.display_name}
                          </div>
                          {application.profile.username && (
                            <a
                              href={`https://farcaster.xyz/${application.profile.username}`}
                              className="text-xs text-muted-foreground hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              @{application.profile.username}
                            </a>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(application.isOnchain ? 1 : 0)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {!application.isOnchain && (
                          <AddRecipientToFlowButton
                            recipient={{
                              address: application.users[0],
                              title: application.title,
                              description: application.description,
                              image: application.image,
                              tagline: application.tagline || "",
                            }}
                            contract={flowContract}
                            chainId={chainId}
                            size="sm"
                            buttonText="Hire"
                            onSuccess={async (hash) => {
                              await publishDraft(application.id, hash)
                            }}
                          />
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={`/draft/${application.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {application.isOnchain ? "View" : "Review"}
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
