import type { Cast } from "@prisma/farcaster"

interface EmbedUrl {
  url: string
}

export function getCastVideos(cast: Pick<Cast, "embeds">): string[] {
  let parsed: unknown

  try {
    parsed = JSON.parse(cast.embeds || "[]")
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed)
    }
  } catch {
    return []
  }

  if (!Array.isArray(parsed)) return []

  return parsed
    .filter(
      (embed): embed is { url: string } =>
        typeof embed === "object" &&
        embed !== null &&
        "url" in embed &&
        typeof embed.url === "string",
    )
    .filter((embed) => embed.url.endsWith(".m3u8"))
    .map((embed) => embed.url)
}
