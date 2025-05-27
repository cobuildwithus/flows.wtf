"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DateTime } from "@/components/ui/date-time"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Profile } from "@/components/user-profile/get-user-profile"
import { Application } from "@prisma/flows"
import { useState } from "react"
import { Markdown } from "@/components/ui/markdown"

interface ApplicationWithProfile extends Application {
  profile: Profile
}

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  opportunityTitle: string
  applications: ApplicationWithProfile[]
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

export function ViewOpportunities(props: Props) {
  const { isOpen, onOpenChange, opportunityTitle, applications } = props
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithProfile | null>(
    null,
  )

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
                  <TableHead className="text-right" />
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
                    <TableCell>{getStatusBadge(application.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedApplication(application)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedApplication}
        onOpenChange={(open) => !open && setSelectedApplication(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader className="hidden">
            <DialogTitle>{selectedApplication?.profile.display_name}</DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="flex flex-col gap-4 whitespace-pre-wrap break-words text-sm leading-6">
              <Markdown>{selectedApplication.content}</Markdown>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
