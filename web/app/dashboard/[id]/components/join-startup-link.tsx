import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getRevnetUrl } from "@/lib/revnet/revnet-lib"
import { Users, Coins, TrendingUp, Vote, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface Props {
  startupTitle: string
  projectId: bigint
  chainId: number
}

export function JoinStartupLink({ startupTitle, projectId, chainId }: Props) {
  const [showDisclaimer, setShowDisclaimer] = useState(false)

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
          <div className="cursor-pointer hover:underline">Join {startupTitle}</div>
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
        <Link
          href={getRevnetUrl(chainId, Number(projectId))}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block rounded-lg border bg-muted/50 p-4 transition-colors hover:border-foreground/20 hover:bg-muted"
        >
          <div className="space-y-1.5">
            <p className="text-sm font-medium">{startupTitle} is a Revnet</p>
            <p className="text-xs text-muted-foreground">
              A lightweight DAO, or 'revenue network', aligned to maximize the growth of the
              project.
            </p>
            <p className="text-xs font-medium text-primary">Learn more →</p>
          </div>
        </Link>

        <div className="mt-4 border-t pt-4">
          <button
            type="button"
            onClick={() => setShowDisclaimer(!showDisclaimer)}
            className="flex w-full items-center justify-between text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <span>Important information</span>
            {showDisclaimer ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>

          {showDisclaimer && (
            <div className="mt-3 space-y-2 text-xs text-muted-foreground">
              <p className="leading-relaxed">
                • Tokens do not represent equity or ownership in {startupTitle}
              </p>
              <p className="leading-relaxed">
                • No financial returns, income, or yield are promised or implied
              </p>
              <p className="leading-relaxed">
                • Tokens function as digital support for the project, not as securities or
                investments
              </p>
              <p className="leading-relaxed">
                • Standard trading laws apply - insider trading is illegal
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
