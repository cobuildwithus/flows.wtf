"use client"

import { useState } from "react"
import { toast } from "sonner"
import { compressImage } from "./compress-image"
import { uploadFile } from "./upload-file"
import useCloudflareStreamUpload from "./use-cloudflare-stream-upload"

export interface UploadedFile {
  name: string
  imageUrl: string
  videoUrl?: string
  contentType: string
}

export function useFileUploads() {
  const [isUploading, setIsUploading] = useState(false)
  const [queue, setQueue] = useState<string[]>([])
  const { uploadVideo } = useCloudflareStreamUpload()

  const uploadFiles = async (files: File[]): Promise<UploadedFile[]> => {
    if (!files.length) {
      toast.error("Please select files to upload")
      return []
    }

    setIsUploading(true)
    setQueue(files.map((file) => file.name))

    const uploads = await Promise.all(
      files.map(async (file) => {
        try {
          if (file.type.startsWith("video/")) {
            const videoResult = await uploadVideo(file)
            if (!videoResult) throw new Error("Video upload failed")
            return {
              videoUrl: videoResult.hlsUrl,
              name: file.name,
              contentType: file.type,
              imageUrl: videoResult.thumbnailUrl,
            }
          }

          const fileToUpload = file.type.startsWith("image/") ? await compressImage(file) : file
          const result = await uploadFile(fileToUpload)
          return {
            imageUrl: result,
            name: file.name,
            contentType: file.type,
          }
        } catch (error) {
          console.error(`Upload error (${file.name}):`, error)
          return { error, name: file.name }
        }
      }),
    )

    const uploadedFiles = uploads.filter((result): result is UploadedFile => "imageUrl" in result)

    const failedUploads = uploads.filter(
      (result): result is { error: unknown; name: string } => "error" in result,
    )

    if (failedUploads.length > 0) {
      console.error("Some files failed to upload:", failedUploads)
      toast.error(`${failedUploads.length} file(s) failed to upload`)
    }

    if (uploadedFiles.length > 0) {
      toast.success(`Uploaded ${uploadedFiles.length} file(s)`, { duration: 500 })
    }

    setIsUploading(false)
    setQueue([])

    return uploadedFiles
  }

  return {
    isUploading,
    uploadQueue: queue,
    uploadFiles,
  }
}
