"use client"

import dynamic from "next/dynamic"
import { ComponentProps } from "react"

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false })

type Props = ComponentProps<typeof ReactPlayer>

export function VideoPlayer(props: Props) {
  return (
    <ReactPlayer
      config={{
        file: {
          forceHLS: true,
          forceSafariHLS: true,
          attributes: { preload: "metadata" },
        },
      }}
      {...props}
    />
  )
}
