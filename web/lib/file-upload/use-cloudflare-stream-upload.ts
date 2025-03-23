import { useState } from "react"

interface UploadResult {
  videoId: string
  hlsUrl: string
  thumbnailUrl: string
}

interface CloudflareUploadHook {
  uploadVideo: (file: File, onProgress?: (progress: number) => void) => Promise<UploadResult>
  progress: number // upload progress in percentage (0-100)
  isUploading: boolean
  error: string | null
}

function useCloudflareStreamUpload(): CloudflareUploadHook {
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Main upload function
  const uploadVideo = async (
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<UploadResult> => {
    setError(null)
    setProgress(0)
    setIsUploading(true)
    try {
      // 1. Request a one-time upload URL and video ID from the backend
      const res = await fetch("/api/get-cloudflare-upload-url", { method: "POST" })
      if (!res.ok) throw new Error((await res.text()) || "Failed to get upload URL")
      const { uploadURL, videoId } = await res.json()
      if (!uploadURL || !videoId) throw new Error("Invalid upload URL response")

      // 2. Use XHR to upload the file to Cloudflare (to track progress)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("POST", uploadURL)
        // Report progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100)
            setProgress(percent)
            if (onProgress) onProgress(percent)
          }
        }
        xhr.onerror = () => reject(new Error("Network error during upload"))
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve()
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }
        // Send the file as form data, as required by Cloudflare direct upload
        const formData = new FormData()
        formData.append("file", file)
        xhr.send(formData)
      })

      // 3. Construct the HLS URL and thumbnail URL using the video ID
      const hlsUrl = `https://videodelivery.net/${videoId}/manifest/video.m3u8`
      // e.g., thumbnail at 3s into the video, height 320px
      const thumbnailUrl = `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg?time=3s&height=320`

      // (Optionally, you might poll Cloudflare or use a webhook to ensure the video
      // is ready before using the HLS URL. Small uploads are usually ready quickly.)
      return { videoId, hlsUrl, thumbnailUrl }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Upload error:", err)
        setError(err.message || "Upload failed")
      } else {
        console.error("Upload error:", err)
        setError("Upload failed")
      }
      throw err
    } finally {
      setIsUploading(false)
    }
  }

  return { uploadVideo, progress, isUploading, error }
}

export default useCloudflareStreamUpload
