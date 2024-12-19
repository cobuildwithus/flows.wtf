import { getIpfsUrl } from "@/lib/utils"
import Image from "next/image"

interface Props {
  image: string
  text: string
}

export function WhyCard(props: Props) {
  const { image, text } = props

  return (
    <div className="relative overflow-hidden rounded-xl border p-5 max-sm:aspect-video lg:h-3/5">
      <Image src={getIpfsUrl(image, "pinata")} alt="" fill className="object-cover" priority />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 to-transparent dark:from-background/90" />
      <p className="relative z-10 flex h-full flex-col justify-end text-balance font-semibold leading-normal text-white">
        {text}
      </p>
    </div>
  )
}
