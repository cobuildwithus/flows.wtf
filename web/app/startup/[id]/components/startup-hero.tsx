import type { Startup } from "@/lib/onchain-startup/startup"
import { Submenu } from "@/components/global/submenu"
import { BuyToken } from "./buy-token"
import { Header } from "./header"
import { JoinStartupLink } from "./join-startup-link"

interface Props {
  startup: Startup
}

export async function StartupHero({ startup }: Props) {
  const submenuLinks = [
    {
      label: "Startup",
      href: "#startup",
      isActive: true,
    },
    {
      label: "Revenue",
      href: "#revenue",
      isActive: false,
    },
    {
      label: "Progress",
      href: "#progress",
      isActive: false,
    },
  ]

  return (
    <div id="startup" className="container mb-20 mt-6 flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="flex flex-col gap-4 lg:col-span-3">
          <Header startup={startup} />
          <div className="border-b border-t py-2 md:py-4">
            <Submenu links={submenuLinks} />
          </div>
          <div className="max-w-3xl">{startup.longMission}</div>
        </div>
        <div className="lg:col-span-1">
          {/* {startup.revnetProjectId && (
            <div className="mt-20 flex flex-col gap-4 rounded-lg border p-4">
              <JoinStartupLink
                startupTitle={startup.title}
                projectId={startup.revnetProjectId}
                chainId={startup.chainId}
              />
              <BuyToken startup={startup} revnetProjectId={startup.revnetProjectId} />
            </div>
          )} */}
        </div>
      </div>
    </div>
  )
}
