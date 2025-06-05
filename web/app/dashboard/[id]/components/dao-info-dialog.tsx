import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, Coins, TrendingUp, Shield } from "lucide-react"
import { RevnetLinkBox } from "./revnet-link-box"
import { Disclaimer } from "./disclaimer"
import { useRevnetTokenDetails } from "@/lib/revnet/hooks/use-revnet-token-details"

interface Props {
  startupTitle: string
  projectId: bigint
  chainId: number
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function DAOInfoDialog({ startupTitle, projectId, chainId, isOpen, onOpenChange }: Props) {
  const { data: tokenDetails } = useRevnetTokenDetails(projectId, chainId)

  const benefits = [
    {
      icon: TrendingUp,
      text: "Support the network's growth",
      color: "text-green-500",
    },
    {
      icon: Coins,
      text: `Become a member of ${startupTitle}`,
      color: "text-yellow-500",
    },
    {
      icon: Shield,
      text: "Vote on how money is spent",
      color: "text-blue-500",
    },
    {
      icon: Users,
      text: "Join a tight-knit community",
      color: "text-purple-500",
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Why should I join?</DialogTitle>
        </DialogHeader>
        <div className="mb-2 space-y-4">
          <p className="text-sm text-muted-foreground">
            {tokenDetails?.symbol || "DAO"} tokens represent your membership in the {startupTitle}{" "}
            network.
          </p>

          <div className="space-y-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div
                  key={`${benefit.icon.name}-${index}`}
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
