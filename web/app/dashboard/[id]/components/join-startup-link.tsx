import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, Coins, TrendingUp, Vote } from "lucide-react"
import { RevnetLinkBox } from "./revnet-link-box"
import { Disclaimer } from "./disclaimer"

interface Props {
  startupTitle: string
  projectId: bigint
  chainId: number
}

export function JoinStartupLink({ startupTitle, projectId, chainId }: Props) {
  const benefits = [
    {
      icon: Users,
      text: `Become a member of ${startupTitle}`,
      color: "text-blue-500",
    },
    {
      icon: Coins,
      text: "Receive tokens",
      color: "text-green-500",
    },
    {
      icon: TrendingUp,
      text: `Support growth of the ${startupTitle} network`,
      color: "text-purple-500",
    },
    {
      icon: Vote,
      text: `Help decide the future of ${startupTitle}`,
      color: "text-orange-500",
    },
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex w-full items-center justify-between gap-1">
          <div className="cursor-pointer hover:underline">Buy token</div>
          <button
            type="button"
            className="ml-1 inline-flex size-4 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="What does joining mean?"
            tabIndex={0}
          >
            <span className="text-xs font-bold">?</span>
          </button>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Why should I join?</DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <div
                key={benefit.icon.name}
                className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
              >
                <div className={`mt-0.5 ${benefit.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm leading-relaxed">{benefit.text}</p>
              </div>
            )
          })}
        </div>
        <RevnetLinkBox startupTitle={startupTitle} projectId={projectId} chainId={chainId} />

        <Disclaimer startupTitle={startupTitle} />
      </DialogContent>
    </Dialog>
  )
}
