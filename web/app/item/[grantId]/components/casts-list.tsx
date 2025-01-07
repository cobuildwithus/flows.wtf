import { CastCard } from "@/components/ui/cast-card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Cast, Profile } from "@prisma/farcaster"
import { EmptyState } from "@/components/ui/empty-state"

interface Props {
  casts: (Cast & { profile: Profile })[]
  buttonText: string
}

export function CastsList(props: Props) {
  const { casts, buttonText } = props

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="h-auto p-0 font-normal text-muted-foreground max-sm:text-sm"
        >
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] sm:max-w-screen-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-medium">Updates</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto">
          {casts.length === 0 ? (
            <EmptyState
              title="No updates yet"
              description="There are no updates posted for this grant yet."
            />
          ) : (
            <div className="mt-4 columns-1 gap-2.5 space-y-2.5 sm:columns-2 lg:columns-3">
              {casts.map((cast) => (
                <CastCard key={cast.hash.toString("hex")} cast={cast} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
