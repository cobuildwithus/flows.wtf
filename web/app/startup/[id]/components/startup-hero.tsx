import type { Startup } from "@/lib/onchain-startup/startup"
import { BuyToken } from "./buy-token"
import { Header } from "./header"
import { Currency } from "@/components/ui/currency"
import { DateTime } from "@/components/ui/date-time"
import { TokenLogo } from "@/app/token/token-logo"
import { getRevnetTokenLogo } from "@/app/token/get-revnet-token-logo"

interface Props {
  startup: Startup
  revenue: number
  balance: number | null
}

export async function StartupHero({ startup, revenue, balance }: Props) {
  const usdBalance = (balance || 0) * Number(startup.fundraisingTokenUsdPrice ?? 0)
  return (
    <div id="startup" className="container mx-auto mb-20 mt-6 flex max-w-6xl flex-col gap-4">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-6">
        <div className="flex flex-col gap-3 lg:col-span-4">
          <Header startup={startup} />
          <div className="border-b border-t py-2 md:py-4">
            <div className="flex gap-8">
              <div className="flex flex-col">
                <div className="text-sm text-muted-foreground">Market Cap</div>
                <Currency className="text-2xl font-bold">{startup.marketCapUsd}</Currency>
              </div>
              <div className="flex flex-col">
                <div className="text-sm text-muted-foreground">Revenue</div>
                <Currency className="text-2xl font-bold">{revenue}</Currency>
              </div>

              {startup.nextPriceIncrease && (
                <div className="flex flex-col">
                  <div className="text-sm text-muted-foreground">Price increases</div>
                  <div className="text-2xl font-bold">
                    <DateTime date={startup.nextPriceIncrease} relative />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-5">
            {startup.jbxProjectId && (
              <div className="flex flex-col gap-2 rounded-lg">
                <BuyToken startup={startup} revnetProjectId={startup.jbxProjectId} />
              </div>
            )}
            <div className="flex flex-col gap-6">
              {(balance ?? 0) > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="text-lg font-medium">Your balance</div>

                  <div className="flex w-full flex-row items-center justify-between py-1.5">
                    <div className="flex flex-row items-center space-x-2.5 rounded-full bg-background">
                      <TokenLogo
                        size={36}
                        src={getRevnetTokenLogo(startup.tokenSymbol)}
                        alt="TOKEN"
                      />
                      <Currency>{usdBalance}</Currency>
                    </div>
                    <span className="text-sm text-muted-foreground">{balance}</span>
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <div className="text-xl font-medium">Mission</div>
                <div className="text-sm text-muted-foreground">{startup.longMission}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
