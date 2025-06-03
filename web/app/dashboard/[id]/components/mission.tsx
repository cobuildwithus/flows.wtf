import { Startup } from "@/lib/onchain-startup/startup"

interface Props {
  startup: Startup
}

export function Mission({ startup }: Props) {
  return (
    <div className="max-w-3xl">
      <div className="rounded-lg border-l-8 border-double border-primary p-5">
        <h2 className="mb-4 text-xl font-bold">Our mission</h2>
        <p className="leading-relaxed">{startup.longMission}</p>
      </div>
    </div>
  )
}
