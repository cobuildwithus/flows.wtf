import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RemoveScroll } from "react-remove-scroll"
import { useMemo, useRef } from "react"
import { type FarcasterProfile } from "@/lib/farcaster"
import type { FlowSearchResult } from "@/lib/flows/types"
import { Badge } from "@/components/ui/badge"
import { getIpfsUrl } from "@/lib/utils"

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  profiles: FarcasterProfile[]
  flows: FlowSearchResult[]
  onSelectProfile: (profile: FarcasterProfile) => void
  onSelectFlow: (flow: FlowSearchResult) => void
  isLoading: boolean
}

export function SearchResultsPopover({
  isOpen,
  onOpenChange,
  profiles,
  flows,
  onSelectProfile,
  onSelectFlow,
  isLoading,
}: Props) {
  const popoverRef = useRef<HTMLDivElement | null>(null)

  const hasResults = useMemo(() => profiles.length > 0 || flows.length > 0, [profiles, flows])

  return (
    <RemoveScroll shards={[popoverRef]}>
      <Popover modal={false} open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <div className="pointer-events-none absolute inset-0" />
        </PopoverTrigger>
        <PopoverContent
          ref={popoverRef}
          className="w-[--radix-popover-trigger-width] overflow-y-scroll p-1"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <ScrollArea className="h-80">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="text-sm text-muted-foreground">Searching...</div>
              </div>
            ) : !hasResults ? (
              <div className="flex items-center justify-center py-4">
                <div className="text-sm text-muted-foreground">No results found</div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Flows - Show first */}
                {flows.length > 0 && (
                  <div>
                    <div className="px-3 py-2">
                      <div className="text-xs font-medium text-muted-foreground">FLOWS</div>
                    </div>
                    {flows.map((flow) => (
                      <button
                        key={flow.id}
                        onClick={() => onSelectFlow(flow)}
                        className="flex w-full items-center space-x-3 rounded-sm px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={getIpfsUrl(flow.image)} />
                          <AvatarFallback className="text-xs">
                            {flow.title.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{flow.title}</div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {flow.activeRecipientCount} recipients
                            </Badge>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Farcaster Profiles - Show second */}
                {profiles.length > 0 && (
                  <div>
                    <div className="px-3 py-2">
                      <div className="text-xs font-medium text-muted-foreground">USERS</div>
                    </div>
                    {profiles.map((profile) => (
                      <button
                        key={profile.fid}
                        onClick={() => onSelectProfile(profile)}
                        className="flex w-full items-center space-x-3 rounded-sm px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {profile.display_name?.slice(0, 2).toUpperCase() ||
                              profile.fname?.slice(0, 2).toUpperCase() ||
                              "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">
                            {profile.display_name || profile.fname || `User ${profile.fid}`}
                          </div>
                          {profile.fname && (
                            <div className="truncate text-xs text-muted-foreground">
                              @{profile.fname}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </RemoveScroll>
  )
}
