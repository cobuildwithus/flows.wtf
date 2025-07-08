import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RemoveScroll } from "react-remove-scroll"
import { useRef } from "react"
import { type FarcasterProfile, getProfileDisplayName } from "@/lib/farcaster"

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  profiles: FarcasterProfile[]
  onSelectProfile: (profile: FarcasterProfile) => void
}

export function FarcasterProfilesPopover({
  isOpen,
  onOpenChange,
  profiles,
  onSelectProfile,
}: Props) {
  const popoverRef = useRef<HTMLDivElement | null>(null)

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
          <ScrollArea className="h-60">
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
                    <div className="truncate text-xs text-muted-foreground">@{profile.fname}</div>
                  )}
                </div>
              </button>
            ))}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </RemoveScroll>
  )
}
