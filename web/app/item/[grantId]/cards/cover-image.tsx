import { cn, getIpfsUrl } from "@/lib/utils"
import Image from "next/image"

interface Props {
  coverImage: {
    url: string
    alt: string
    position: "top" | "center" | "bottom"
  }
  title: string
  tagline: string
}

export function CoverImage(props: Props) {
  const { coverImage, title, tagline } = props

  const { url, alt, position } = coverImage

  return (
    <div className="col-span-full lg:col-span-7">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl lg:aspect-video">
        <Image
          src={getIpfsUrl(url, "pinata")}
          alt={alt}
          fill
          className={cn("object-cover", {
            "object-top": position === "top",
            "object-center": position === "center",
            "object-bottom": position === "bottom",
          })}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 p-5 lg:p-6">
          <h1 className="text-balance text-xl font-bold text-white lg:text-3xl">{title}</h1>
          <p className="mt-2 text-pretty text-base text-white/80 lg:text-lg">{tagline}</p>
        </div>
      </div>
    </div>
  )
}
