import type { Startup } from "@/lib/onchain-startup/startup"
import { BuyToken } from "./buy-token"
import { Header } from "./header"
import { JoinStartupLink } from "./join-startup-link"
import { Currency } from "@/components/ui/currency"

interface Props {
  startup: Startup
  revenue: number
}

export async function StartupHero({ startup, revenue }: Props) {
  return (
    <div id="startup" className="container mx-auto mb-20 mt-6 flex max-w-6xl flex-col gap-4">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="flex flex-col gap-3 lg:col-span-3">
          <Header startup={startup} />
          <div className="border-b border-t py-2 md:py-4">
            <div className="flex gap-8">
              <div className="flex flex-col">
                <div className="text-sm text-muted-foreground">Market Cap</div>
                <Currency className="text-2xl font-bold">{revenue}</Currency>
              </div>
              <div className="flex flex-col">
                <div className="text-sm text-muted-foreground">Top Holders</div>
                <div className="text-2xl font-bold">247</div>
              </div>
              <div className="flex flex-col">
                <div className="text-sm text-muted-foreground">Revenue</div>
                <Currency className="text-2xl font-bold">{revenue}</Currency>
              </div>
            </div>
          </div>
          <div className="max-w-3xl">{startup.longMission}</div>
        </div>
        <div className="lg:col-span-1">
          <div className="flex flex-col gap-4">
            {startup.revnetProjectId && (
              <div className="flex flex-col gap-2 rounded-lg">
                <JoinStartupLink
                  startupTitle={startup.title}
                  projectId={startup.revnetProjectId}
                  chainId={startup.chainId}
                />
                <BuyToken startup={startup} revnetProjectId={startup.revnetProjectId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
