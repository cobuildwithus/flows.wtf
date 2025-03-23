/**
 * Extracts the video ID from a Cloudflare Stream URL and returns the thumbnail URL
 * @param streamUrl - The Cloudflare Stream URL (HLS URL)
 * @param options - Optional parameters for the thumbnail
 * @param options.time - Time position for the thumbnail (default: "3s")
 * @param options.height - Height of the thumbnail in pixels (default: 320)
 * @returns The thumbnail URL or null if the URL is invalid
 */
export function getThumbnailUrlFromCloudflareStream(
  streamUrl: string,
  options: { time?: string; height?: number } = {},
): string | null {
  const { time, height } = options

  const match = streamUrl.match(/customer-[^.]+\.cloudflarestream\.com\/([^\/]+)\//)
  if (!match || !match[1]) return null

  const videoId = match[1]

  const url = `https://customer-3q4p4o6b2z3t9lrn.cloudflarestream.com/${videoId}/thumbnails/thumbnail.jpg`

  const params = new URLSearchParams()
  if (time) params.append("time", time)
  if (height) params.append("height", height.toString())

  const queryString = params.toString()
  return queryString ? `${url}?${queryString}` : url
}
