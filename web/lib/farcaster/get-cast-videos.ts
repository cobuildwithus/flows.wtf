import { Cast } from "@prisma/farcaster"

interface EmbedUrl {
  url: string
}

export function getCastVideos(cast: Cast): string[] {
  return JSON.parse(cast.embeds || "[]")
    .filter((embed: EmbedUrl): embed is EmbedUrl => "url" in embed)
    .filter((embed: EmbedUrl) => embed.url.endsWith(".m3u8"))
    .map((embed: EmbedUrl) => embed.url)
}
