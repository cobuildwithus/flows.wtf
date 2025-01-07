"use client"

import dynamic from "next/dynamic"
import { ComponentProps } from "react"

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false })

type Props = ComponentProps<typeof ReactPlayer>

export function VideoPlayer(props: Props) {
  return (
    <ReactPlayer
      controls
      playsinline
      config={{
        file: {
          forceHLS: true,
          forceSafariHLS: true,
          attributes: {
            preload: "metadata",
            crossOrigin: "anonymous",
          },
        },
      }}
      onError={(e) => console.error("Video Player Error:", e)}
      {...props}
    />
  )
}
