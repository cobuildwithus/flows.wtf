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
  // Default options
  const { time = "3s", height = 320 } = options

  // Extract video ID from the HLS URL
  // Expected format: https://videodelivery.net/{videoId}/manifest/video.m3u8
  const match = streamUrl.match(/videodelivery\.net\/([^\/]+)\//)
  if (!match || !match[1]) return null

  const videoId = match[1]

  // Construct the thumbnail URL using the same format as in useCloudflareStreamUpload
  return `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg?time=${time}&height=${height}`
}
