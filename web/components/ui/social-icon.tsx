import farcasterIcon from "@/public/farcaster.svg"
import Image from "next/image"
import { SocialIcon as ReactSocialIcon } from "react-social-icons/component"
import "react-social-icons/instagram"
import "react-social-icons/tiktok"
import "react-social-icons/x"
import "react-social-icons/youtube"

interface Props {
  url: string
  style?: React.CSSProperties
}

export function SocialIcon({ url, style }: Props) {
  if (url.includes("warpcast") || url.includes("farcaster")) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <div
          style={{ width: 50, height: 50, backgroundColor: "#855DCD", ...style }}
          className="rounded-full p-2"
        >
          <Image src={farcasterIcon} alt="Farcaster" width={50} height={50} className="size-full" />
        </div>
      </a>
    )
  }

  return <ReactSocialIcon url={url} style={style} />
}
