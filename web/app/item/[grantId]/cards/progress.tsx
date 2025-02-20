import { getIpfsUrl } from "@/lib/utils"
import Image from "next/image"

interface Props {
  image: string
  text: string
}

export function ProgressCard(props: Props) {
  const { image, text } = props

  return (
    <div className="relative flex flex-col justify-between rounded-xl border p-5 max-sm:aspect-video lg:h-3/5">
      <Image
        src={getIpfsUrl(image, "pinata")}
        alt=" "
        fill
        className="pointer-events-none rounded-xl object-cover"
        priority
      />
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 via-black/10 to-black/20 backdrop-blur-lg dark:from-background/80 dark:via-background/30 dark:to-background/70" />
      <div className="relative z-10 text-[11px] uppercase tracking-wider text-white opacity-80">
        Our Progress
      </div>
      <p className="relative z-10 text-balance font-semibold leading-normal text-white">{text}</p>
    </div>
  )
}
