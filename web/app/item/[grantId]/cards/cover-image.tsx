import { getIpfsUrl } from "@/lib/utils"
import Image from "next/image"

interface Props {
  coverImage: string
  title: string
  tagline: string
}

export function CoverImage(props: Props) {
  const { coverImage, title, tagline } = props

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl lg:aspect-video">
      <Image
        src={getIpfsUrl(coverImage, "pinata")}
        alt={title}
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent via-30% to-black/75" />
      <div className="absolute bottom-0 p-5 lg:p-6">
        <h1 className="text-balance text-xl font-bold text-white lg:text-3xl">{title}</h1>
        <p className="mt-2 hidden text-pretty text-base text-white/80 sm:block lg:text-lg">
          {tagline}
        </p>
      </div>
    </div>
  )
}
